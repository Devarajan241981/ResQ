#include "resq_native.h"

#include <png.h>
#include <pthread.h>
#include <qrencode.h>
#include <setjmp.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

static int write_qr_as_png(QRcode *qr, int scale, const char *output_path) {
    int size = qr->width * scale;

    FILE *fp = fopen(output_path, "wb");
    if (!fp) return 0;

    png_structp png_ptr = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    png_infop info_ptr = png_ptr ? png_create_info_struct(png_ptr) : NULL;
    if (!png_ptr || !info_ptr) {
        if (png_ptr) png_destroy_write_struct(&png_ptr, NULL);
        fclose(fp);
        return 0;
    }

    if (setjmp(png_jmpbuf(png_ptr))) {
        png_destroy_write_struct(&png_ptr, &info_ptr);
        fclose(fp);
        return 0;
    }

    png_init_io(png_ptr, fp);
    png_set_IHDR(
        png_ptr, info_ptr, size, size, 8,
        PNG_COLOR_TYPE_GRAY, PNG_INTERLACE_NONE,
        PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT
    );
    png_write_info(png_ptr, info_ptr);

    png_bytep row = (png_bytep)malloc(size);
    for (int y = 0; y < size; y++) {
        int module_row = y / scale;
        for (int x = 0; x < size; x++) {
            int module_col = x / scale;
            uint8_t module = qr->data[module_row * qr->width + module_col] & 0x01;
            row[x] = module ? 0 : 255; /* dark module = 0 (black), light = 255 (white) */
        }
        png_write_row(png_ptr, row);
    }
    free(row);

    png_write_end(png_ptr, NULL);
    png_destroy_write_struct(&png_ptr, &info_ptr);
    fclose(fp);
    return 1;
}

int resq_generate_qr_png(const char *text, int scale, const char *output_path) {
    if (!text || !output_path || scale <= 0) return 0;

    QRcode *qr = QRcode_encodeString(text, 0, QR_ECLEVEL_M, QR_MODE_8, 1);
    if (!qr) return 0;

    int ok = write_qr_as_png(qr, scale, output_path);
    QRcode_free(qr);
    return ok;
}

typedef struct {
    const char **texts;
    const char **output_paths;
    size_t n;
    int scale;
    uint8_t *results;
    size_t next_index;      /* shared cursor, guarded by `lock` */
    pthread_mutex_t *lock;
} qr_pool_t;

/* Each worker pulls the next unclaimed index until the batch is drained —
 * a small work-stealing pool bounded to the number of CPU cores, rather than
 * one OS thread per item (which would blow up for a large batch). */
static void *qr_pool_worker(void *arg) {
    qr_pool_t *pool = (qr_pool_t *)arg;

    for (;;) {
        pthread_mutex_lock(pool->lock);
        size_t i = pool->next_index++;
        pthread_mutex_unlock(pool->lock);

        if (i >= pool->n) break;

        pool->results[i] = (uint8_t)resq_generate_qr_png(pool->texts[i], pool->scale, pool->output_paths[i]);
    }
    return NULL;
}

int resq_generate_qr_batch(
    const char **texts, const char **output_paths, size_t n, int scale,
    uint8_t *results
) {
    if (!texts || !output_paths || !results || n == 0) return (int)n;

    long cores = sysconf(_SC_NPROCESSORS_ONLN);
    size_t worker_count = (cores > 0) ? (size_t)cores : 4;
    if (worker_count > n) worker_count = n;

    pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
    qr_pool_t pool = {texts, output_paths, n, scale, results, 0, &lock};

    pthread_t *threads = (pthread_t *)malloc(sizeof(pthread_t) * worker_count);
    for (size_t i = 0; i < worker_count; i++) {
        pthread_create(&threads[i], NULL, qr_pool_worker, &pool);
    }
    for (size_t i = 0; i < worker_count; i++) {
        pthread_join(threads[i], NULL);
    }
    free(threads);

    int failures = 0;
    for (size_t i = 0; i < n; i++) {
        if (!results[i]) failures++;
    }
    return failures;
}

#include "resq_native.h"

#include <math.h>
#include <setjmp.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <jpeglib.h>
#include <png.h>

int resq_resize_rgb(
    const uint8_t *src, int src_w, int src_h, int channels,
    uint8_t *dst, int dst_w, int dst_h
) {
    if (!src || !dst || src_w <= 0 || src_h <= 0 || dst_w <= 0 || dst_h <= 0 || channels <= 0) {
        return 0;
    }

    double x_ratio = (double)src_w / (double)dst_w;
    double y_ratio = (double)src_h / (double)dst_h;

    for (int y = 0; y < dst_h; y++) {
        double sy = (y + 0.5) * y_ratio - 0.5;
        int y0 = (int)floor(sy);
        double fy = sy - y0;
        int y1 = y0 + 1;
        if (y0 < 0) { y0 = 0; }
        if (y1 >= src_h) { y1 = src_h - 1; }

        for (int x = 0; x < dst_w; x++) {
            double sx = (x + 0.5) * x_ratio - 0.5;
            int x0 = (int)floor(sx);
            double fx = sx - x0;
            int x1 = x0 + 1;
            if (x0 < 0) { x0 = 0; }
            if (x1 >= src_w) { x1 = src_w - 1; }

            for (int c = 0; c < channels; c++) {
                double top = src[(y0 * src_w + x0) * channels + c] * (1 - fx)
                           + src[(y0 * src_w + x1) * channels + c] * fx;
                double bottom = src[(y1 * src_w + x0) * channels + c] * (1 - fx)
                              + src[(y1 * src_w + x1) * channels + c] * fx;
                double value = top * (1 - fy) + bottom * fy;
                if (value < 0) value = 0;
                if (value > 255) value = 255;
                dst[(y * dst_w + x) * channels + c] = (uint8_t)(value + 0.5);
            }
        }
    }
    return 1;
}

int resq_encode_jpeg(
    const uint8_t *rgb, int w, int h, int quality,
    uint8_t **out_buf, size_t *out_len
) {
    if (!rgb || !out_buf || !out_len || w <= 0 || h <= 0) {
        return 0;
    }

    struct jpeg_compress_struct cinfo;
    struct jpeg_error_mgr jerr;
    cinfo.err = jpeg_std_error(&jerr);
    jpeg_create_compress(&cinfo);

    unsigned char *mem_buf = NULL;
    unsigned long mem_size = 0;
    jpeg_mem_dest(&cinfo, &mem_buf, &mem_size);

    cinfo.image_width = w;
    cinfo.image_height = h;
    cinfo.input_components = 3;
    cinfo.in_color_space = JCS_RGB;
    jpeg_set_defaults(&cinfo);
    jpeg_set_quality(&cinfo, quality < 1 ? 1 : (quality > 100 ? 100 : quality), TRUE);

    jpeg_start_compress(&cinfo, TRUE);
    int row_stride = w * 3;
    JSAMPROW row_pointer[1];
    while (cinfo.next_scanline < cinfo.image_height) {
        row_pointer[0] = (JSAMPROW)&rgb[cinfo.next_scanline * row_stride];
        jpeg_write_scanlines(&cinfo, row_pointer, 1);
    }
    jpeg_finish_compress(&cinfo);
    jpeg_destroy_compress(&cinfo);

    *out_buf = (uint8_t *)mem_buf;
    *out_len = (size_t)mem_size;
    return 1;
}

typedef struct {
    uint8_t *buf;
    size_t len;
    size_t cap;
} png_mem_buffer_t;

static void png_write_callback(png_structp png_ptr, png_bytep data, png_size_t length) {
    png_mem_buffer_t *buffer = (png_mem_buffer_t *)png_get_io_ptr(png_ptr);
    if (buffer->len + length > buffer->cap) {
        buffer->cap = (buffer->len + length) * 2;
        buffer->buf = (uint8_t *)realloc(buffer->buf, buffer->cap);
    }
    memcpy(buffer->buf + buffer->len, data, length);
    buffer->len += length;
}

static void png_flush_callback(png_structp png_ptr) {
    (void)png_ptr;
}

int resq_encode_png(
    const uint8_t *rgba, int w, int h,
    uint8_t **out_buf, size_t *out_len
) {
    if (!rgba || !out_buf || !out_len || w <= 0 || h <= 0) {
        return 0;
    }

    png_structp png_ptr = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
    if (!png_ptr) return 0;
    png_infop info_ptr = png_create_info_struct(png_ptr);
    if (!info_ptr) {
        png_destroy_write_struct(&png_ptr, NULL);
        return 0;
    }

    if (setjmp(png_jmpbuf(png_ptr))) {
        png_destroy_write_struct(&png_ptr, &info_ptr);
        return 0;
    }

    png_mem_buffer_t buffer = {0};
    buffer.cap = (size_t)w * h * 4 + 1024;
    buffer.buf = (uint8_t *)malloc(buffer.cap);

    png_set_write_fn(png_ptr, &buffer, png_write_callback, png_flush_callback);

    png_set_IHDR(
        png_ptr, info_ptr, w, h, 8,
        PNG_COLOR_TYPE_RGBA, PNG_INTERLACE_NONE,
        PNG_COMPRESSION_TYPE_DEFAULT, PNG_FILTER_TYPE_DEFAULT
    );
    png_write_info(png_ptr, info_ptr);

    png_bytep *row_pointers = (png_bytep *)malloc(sizeof(png_bytep) * h);
    for (int y = 0; y < h; y++) {
        row_pointers[y] = (png_bytep)&rgba[y * w * 4];
    }
    png_write_image(png_ptr, row_pointers);
    png_write_end(png_ptr, NULL);

    free(row_pointers);
    png_destroy_write_struct(&png_ptr, &info_ptr);

    *out_buf = buffer.buf;
    *out_len = buffer.len;
    return 1;
}

void resq_free_buffer(uint8_t *buf) {
    free(buf);
}

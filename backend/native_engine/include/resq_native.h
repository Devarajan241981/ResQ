/*
 * ResQ India native performance engine — public C API.
 *
 * This library holds NO business logic. It exists purely for CPU-bound work
 * that's cheap to express in C but expensive in interpreted Python: geo math,
 * image resize/encode, QR rendering, and thin OpenSSL wrappers. Django/DRF
 * calls into it via ctypes (see backend/apps/common/native.py); every decision
 * about *when* to call these functions, and what to do with the result, lives
 * in Django. Untrusted image bytes are decoded by Pillow (a hardened decoder)
 * before ever reaching this library — this library only ever touches raw
 * pixel buffers and plain text/byte strings, never untrusted-format headers.
 */
#ifndef RESQ_NATIVE_H
#define RESQ_NATIVE_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ---------------------------------------------------------------------- */
/* Geo engine — pure math, no external dependency.                        */
/* ---------------------------------------------------------------------- */

/* Great-circle distance between two lat/lng points, in kilometres. */
double resq_haversine_km(double lat1, double lng1, double lat2, double lng2);

/* 1 if (lat2,lng2) is within radius_km of (lat1,lng1), else 0. */
int resq_is_within_radius(double lat1, double lng1, double lat2, double lng2, double radius_km);

/*
 * Batch radius filter: for each of the n points in (lats,lngs), writes 1/0
 * into out_mask depending on whether it's within radius_km of the origin.
 * Lets Python filter thousands of candidates (volunteers, hospitals, shelters)
 * in one native call instead of one Python-level function call per row.
 */
void resq_radius_filter_batch(
    double origin_lat, double origin_lng, double radius_km,
    const double *lats, const double *lngs, size_t n,
    uint8_t *out_mask
);

/*
 * Point-in-polygon test (ray casting). polygon_lats/polygon_lngs are parallel
 * arrays of length n describing a closed polygon (first point need not repeat
 * as the last). Returns 1 if (lat,lng) is inside, else 0.
 */
int resq_point_in_polygon(
    double lat, double lng,
    const double *polygon_lats, const double *polygon_lngs, size_t n
);

/* ---------------------------------------------------------------------- */
/* Image engine — thin wrappers around libjpeg-turbo / libpng.            */
/* Operates on already-decoded raw pixel buffers (decode untrusted files  */
/* with Pillow in Python first; this layer never parses untrusted bytes). */
/* ---------------------------------------------------------------------- */

/* Bilinear resize of an interleaved 8-bit buffer with `channels` components. */
int resq_resize_rgb(
    const uint8_t *src, int src_w, int src_h, int channels,
    uint8_t *dst, int dst_w, int dst_h
);

/*
 * Encode raw interleaved RGB (channels=3) as JPEG at the given quality (1-100).
 * On success, *out_buf is malloc'd (caller must call resq_free_buffer) and
 * *out_len is set. Returns 1 on success, 0 on failure.
 */
int resq_encode_jpeg(
    const uint8_t *rgb, int w, int h, int quality,
    uint8_t **out_buf, size_t *out_len
);

/*
 * Encode raw interleaved RGBA (channels=4) as PNG. Same buffer-ownership
 * convention as resq_encode_jpeg.
 */
int resq_encode_png(
    const uint8_t *rgba, int w, int h,
    uint8_t **out_buf, size_t *out_len
);

/* Frees a buffer allocated by resq_encode_jpeg / resq_encode_png. */
void resq_free_buffer(uint8_t *buf);

/* ---------------------------------------------------------------------- */
/* QR engine — libqrencode wrapper, with a threaded batch entry point.    */
/* ---------------------------------------------------------------------- */

/* Renders `text` as a PNG QR code at `scale` px/module. Returns 1 on success. */
int resq_generate_qr_png(const char *text, int scale, const char *output_path);

/*
 * Renders n QR codes in parallel (one worker thread per hardware core).
 * texts/output_paths are parallel arrays of length n. results[i] is set to
 * 1/0 for success/failure of that item. Returns the number of failures.
 */
int resq_generate_qr_batch(
    const char **texts, const char **output_paths, size_t n, int scale,
    uint8_t *results
);

/* ---------------------------------------------------------------------- */
/* Crypto engine — OpenSSL EVP wrappers. No custom cryptography.          */
/* ---------------------------------------------------------------------- */

/* Hex-encoded SHA-256 digest of `data` (out_hex must be >= 65 bytes: 64 + NUL). */
int resq_sha256_hex(const uint8_t *data, size_t len, char *out_hex);

/* Cryptographically secure random token, hex-encoded (out_hex must be >= 2*num_bytes+1). */
int resq_random_token_hex(int num_bytes, char *out_hex);

/*
 * AES-256-GCM encrypt. key must be 32 bytes, iv must be 12 bytes (generated
 * internally and written to iv_out if non-NULL). tag_out must be 16 bytes.
 * out_buf must be pre-allocated by the caller with at least `len` bytes.
 * Returns 1 on success.
 */
int resq_aes256gcm_encrypt(
    const uint8_t *plaintext, size_t len,
    const uint8_t *key, uint8_t *iv_out,
    uint8_t *out_buf, uint8_t *tag_out
);

/* AES-256-GCM decrypt counterpart. Returns 1 on success, 0 if tag verification fails. */
int resq_aes256gcm_decrypt(
    const uint8_t *ciphertext, size_t len,
    const uint8_t *key, const uint8_t *iv, const uint8_t *tag,
    uint8_t *out_buf
);

#ifdef __cplusplus
}
#endif

#endif /* RESQ_NATIVE_H */

#include "resq_native.h"

#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/sha.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void bytes_to_hex(const uint8_t *bytes, size_t len, char *out_hex) {
    static const char *digits = "0123456789abcdef";
    for (size_t i = 0; i < len; i++) {
        out_hex[i * 2] = digits[bytes[i] >> 4];
        out_hex[i * 2 + 1] = digits[bytes[i] & 0x0F];
    }
    out_hex[len * 2] = '\0';
}

int resq_sha256_hex(const uint8_t *data, size_t len, char *out_hex) {
    if (!data || !out_hex) return 0;

    uint8_t digest[SHA256_DIGEST_LENGTH];
    unsigned int digest_len = 0;

    EVP_MD_CTX *ctx = EVP_MD_CTX_new();
    if (!ctx) return 0;

    int ok = EVP_DigestInit_ex(ctx, EVP_sha256(), NULL)
          && EVP_DigestUpdate(ctx, data, len)
          && EVP_DigestFinal_ex(ctx, digest, &digest_len);
    EVP_MD_CTX_free(ctx);

    if (!ok) return 0;
    bytes_to_hex(digest, digest_len, out_hex);
    return 1;
}

int resq_random_token_hex(int num_bytes, char *out_hex) {
    if (num_bytes <= 0 || !out_hex) return 0;

    uint8_t *buf = (uint8_t *)malloc((size_t)num_bytes);
    if (!buf) return 0;

    int ok = RAND_bytes(buf, num_bytes) == 1;
    if (ok) {
        bytes_to_hex(buf, (size_t)num_bytes, out_hex);
    }
    free(buf);
    return ok;
}

#define AES_KEY_LEN 32
#define AES_IV_LEN 12
#define AES_TAG_LEN 16

int resq_aes256gcm_encrypt(
    const uint8_t *plaintext, size_t len,
    const uint8_t *key, uint8_t *iv_out,
    uint8_t *out_buf, uint8_t *tag_out
) {
    if (!plaintext || !key || !iv_out || !out_buf || !tag_out) return 0;

    if (RAND_bytes(iv_out, AES_IV_LEN) != 1) return 0;

    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) return 0;

    int out_len = 0, final_len = 0;
    int ok = EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL)
          && EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, AES_IV_LEN, NULL)
          && EVP_EncryptInit_ex(ctx, NULL, NULL, key, iv_out)
          && EVP_EncryptUpdate(ctx, out_buf, &out_len, plaintext, (int)len)
          && EVP_EncryptFinal_ex(ctx, out_buf + out_len, &final_len)
          && EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, AES_TAG_LEN, tag_out);

    EVP_CIPHER_CTX_free(ctx);
    return ok ? 1 : 0;
}

int resq_aes256gcm_decrypt(
    const uint8_t *ciphertext, size_t len,
    const uint8_t *key, const uint8_t *iv, const uint8_t *tag,
    uint8_t *out_buf
) {
    if (!ciphertext || !key || !iv || !tag || !out_buf) return 0;

    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) return 0;

    int out_len = 0, final_len = 0;
    int ok = EVP_DecryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL)
          && EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, AES_IV_LEN, NULL)
          && EVP_DecryptInit_ex(ctx, NULL, NULL, key, iv)
          && EVP_DecryptUpdate(ctx, out_buf, &out_len, ciphertext, (int)len)
          && EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, AES_TAG_LEN, (void *)tag);

    int verify_ok = ok && EVP_DecryptFinal_ex(ctx, out_buf + out_len, &final_len) > 0;

    EVP_CIPHER_CTX_free(ctx);
    return verify_ok ? 1 : 0;
}

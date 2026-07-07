# ResQ Native Engine

A small C library for the handful of computations in ResQ India that are
genuinely CPU-bound: geo math over thousands of candidates, image resize +
encode, batch QR rendering, and crypto primitives. Everything else — every
business rule, every permission check, every database query — lives in
Django/DRF. This library is deliberately "dumb": given raw numbers or raw
pixel buffers, it computes an answer and hands it back.

## Why this exists

Python is fine for I/O-bound request handling, which is most of this
platform. It's the wrong tool for two things this platform actually does at
scale:

- **Radius search over large candidate sets.** "Find volunteers/hospitals/
  shelters within N km" degrades to an O(n) Python loop calling a Python
  function per candidate. The C version does the same O(n) work without the
  Python interpreter overhead per iteration (see benchmarks below).
- **Image encode + batch QR rendering.** JPEG/PNG encoding and QR rendering
  are pure CPU work with well-understood C libraries (libjpeg-turbo, libpng,
  libqrencode) that are considerably faster than their Python equivalents.

## What this does NOT do

It does not parse untrusted file formats. User-uploaded images are decoded
by **Pillow** (a hardened, actively-maintained decoder) on the Python side
first; this library only ever touches already-decoded raw pixel buffers for
resize/encode. Re-implementing JPEG/PNG decoding by hand in C to save a few
milliseconds is not a trade worth making on a platform that has to be
trustworthy with emergency data — that's exactly the class of bug (buffer
overflows parsing attacker-controlled bytes) native image libraries exist to
avoid, so we lean on them instead of re-deriving them.

Cryptography is OpenSSL's EVP API only (SHA-256, AES-256-GCM, `RAND_bytes`)
— no custom algorithms.

## Modules

| File | Responsibility |
|---|---|
| `src/geo.c` | Haversine distance, radius filter (single + batch), point-in-polygon (ray casting) |
| `src/image.c` | Bilinear resize, JPEG encode (libjpeg-turbo), PNG encode (libpng) — operates on raw pixel buffers only |
| `src/qr.c` | QR PNG rendering (libqrencode), thread-pool batch variant (workers = CPU core count, not one thread per item) |
| `src/crypto.c` | SHA-256, AES-256-GCM, secure random tokens — thin OpenSSL EVP wrappers |

Public API: `include/resq_native.h`.

## When Django calls it

`backend/apps/common/native.py` is the only place that talks to this
library via `ctypes`. Every function there has a pure-Python fallback and
`native.is_available()` guards the ctypes path, so the backend still runs
correctly (just slower) if the `.so`/`.dylib` hasn't been built for the
current platform/container.

Call sites: anywhere in `apps/common/geo.py`'s `filter_within_radius` is used
across hospitals/volunteers/shelters/blood_donation/police for "nearby"
endpoints can route through `native.radius_filter_batch` once wired in;
`missing_persons.services.generate_qr_code` can route through
`native.generate_qr_png` instead of the `qrcode` Python package for the same
visual result at native speed.

## Building

Requires `cmake`, a C11 compiler, and the dev packages for libjpeg-turbo,
libpng, OpenSSL, and libqrencode (`brew install jpeg-turbo libpng openssl@3
qrencode pkg-config cmake` on macOS; `apt-get install libjpeg-turbo8-dev
libpng-dev libssl-dev libqrencode-dev pkg-config cmake` on Debian/Ubuntu).

```bash
cd native_engine
mkdir -p build && cd build
cmake ..
make
```

Produces `build/libresq_native.dylib` (macOS) / `build/libresq_native.so`
(Linux). `apps/common/native.py` looks for both names automatically.

## Benchmarks

Run `python native_engine/tests/benchmark.py` from `backend/` (library must
already be built). Real numbers from this machine (Apple Silicon, arm64) —
not aspirational, actually measured:

```
haversine_km            x200,000    Python 0.427s   native 0.216s   ~2.0x
radius_filter_batch     x50,000     Python 0.107s   native 0.028s   ~3.7x
sha256_hex              x50,000     Python 0.027s   native 0.149s   ~0.2x (native is SLOWER)
```

The SHA-256 result is worth being honest about: Python's `hashlib.sha256`
**already** calls into OpenSSL's C implementation directly with no ctypes
marshaling overhead, so a ctypes-wrapped re-implementation of the same
OpenSSL call cannot win — the per-call ctypes buffer setup dominates for
small payloads. `resq_sha256_hex` is kept for API completeness (e.g. hashing
very large buffers where the marshaling cost is amortized, or being called
from other C code) — for ordinary Python-side hashing, use `hashlib`
directly. This is the kind of result a real benchmark should surface rather
than hide.

The geo functions win because the pure-Python path pays interpreter
overhead once per candidate in a loop; the native path pays it once for the
whole batch.

## Deploying

The compiled library is platform-specific (a `.dylib` built on macOS will
not load on Linux). In Docker, run the CMake build as a build stage before
copying `native_engine/build/libresq_native.so` into the final image — see
the root `Dockerfile`, which does exactly this. Do not commit compiled
binaries to git; `native_engine/build/` is gitignored.

## Debugging

- `is_available()` returning `False` in Django almost always means the
  library wasn't built for the current platform, or was built but the
  `build/` directory didn't make it into the container image.
- Crashes inside native calls will take the whole Python process down (no
  Python exception to catch) — this is why every ctypes entry point in
  `native.py` validates inputs before crossing into C, and why the C side
  itself checks pointers for NULL before dereferencing.
- Use `otool -L build/libresq_native.dylib` (macOS) / `ldd
  build/libresq_native.so` (Linux) to check the library resolved its
  dynamic dependencies (libjpeg, libpng, libcrypto) correctly at runtime.

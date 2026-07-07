"""
ctypes bindings for the native_engine C library (see /native_engine).
This module owns ALL business logic decisions about *when* to call native
code; the C side is a pure computation layer with no Django/business logic.

If the compiled library isn't present (e.g. it wasn't built for this platform
yet), `is_available()` returns False and callers should fall back to the
pure-Python equivalents (apps.common.geo, qrcode, Pillow).
"""
import ctypes
import os
from pathlib import Path

NATIVE_ENGINE_DIR = Path(__file__).resolve().parent.parent.parent / "native_engine"

_LIB_CANDIDATES = [
    NATIVE_ENGINE_DIR / "build" / "libresq_native.dylib",
    NATIVE_ENGINE_DIR / "build" / "libresq_native.so",
    NATIVE_ENGINE_DIR / "build" / "resq_native.dll",
]

_lib = None
for _path in _LIB_CANDIDATES:
    if _path.exists():
        _lib = ctypes.CDLL(str(_path))
        break


def is_available() -> bool:
    return _lib is not None


if _lib is not None:
    _lib.resq_haversine_km.argtypes = [ctypes.c_double] * 4
    _lib.resq_haversine_km.restype = ctypes.c_double

    _lib.resq_radius_filter_batch.argtypes = [
        ctypes.c_double, ctypes.c_double, ctypes.c_double,
        ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_size_t,
        ctypes.POINTER(ctypes.c_uint8),
    ]

    _lib.resq_point_in_polygon.argtypes = [
        ctypes.c_double, ctypes.c_double,
        ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_size_t,
    ]
    _lib.resq_point_in_polygon.restype = ctypes.c_int

    _lib.resq_generate_qr_png.argtypes = [ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p]
    _lib.resq_generate_qr_png.restype = ctypes.c_int

    _lib.resq_sha256_hex.argtypes = [ctypes.POINTER(ctypes.c_uint8), ctypes.c_size_t, ctypes.c_char_p]
    _lib.resq_sha256_hex.restype = ctypes.c_int

    _lib.resq_random_token_hex.argtypes = [ctypes.c_int, ctypes.c_char_p]
    _lib.resq_random_token_hex.restype = ctypes.c_int


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    if not is_available():
        from apps.common.geo import haversine_km as py_haversine_km

        return py_haversine_km(lat1, lng1, lat2, lng2)
    return _lib.resq_haversine_km(lat1, lng1, lat2, lng2)


def radius_filter_batch(origin_lat: float, origin_lng: float, radius_km: float, points: list[tuple[float, float]]) -> list[bool]:
    """points: list of (lat, lng). Returns a parallel list of booleans."""
    if not is_available() or not points:
        return [
            haversine_km(origin_lat, origin_lng, lat, lng) <= radius_km
            for lat, lng in points
        ]

    n = len(points)
    lats = (ctypes.c_double * n)(*[p[0] for p in points])
    lngs = (ctypes.c_double * n)(*[p[1] for p in points])
    mask = (ctypes.c_uint8 * n)()

    _lib.resq_radius_filter_batch(origin_lat, origin_lng, radius_km, lats, lngs, n, mask)
    return [bool(m) for m in mask]


def point_in_polygon(lat: float, lng: float, polygon: list[tuple[float, float]]) -> bool:
    if not is_available() or len(polygon) < 3:
        return False

    n = len(polygon)
    lats = (ctypes.c_double * n)(*[p[0] for p in polygon])
    lngs = (ctypes.c_double * n)(*[p[1] for p in polygon])
    return bool(_lib.resq_point_in_polygon(lat, lng, lats, lngs, n))


def generate_qr_png(text: str, output_path: str, scale: int = 8) -> bool:
    if not is_available():
        return False
    return bool(_lib.resq_generate_qr_png(text.encode("utf-8"), scale, str(output_path).encode("utf-8")))


def sha256_hex(data: bytes) -> str:
    if not is_available():
        import hashlib

        return hashlib.sha256(data).hexdigest()

    buf = (ctypes.c_uint8 * len(data)).from_buffer_copy(data)
    out = ctypes.create_string_buffer(65)
    _lib.resq_sha256_hex(buf, len(data), out)
    return out.value.decode("ascii")


def random_token_hex(num_bytes: int = 32) -> str:
    if not is_available():
        return os.urandom(num_bytes).hex()

    out = ctypes.create_string_buffer(num_bytes * 2 + 1)
    _lib.resq_random_token_hex(num_bytes, out)
    return out.value.decode("ascii")

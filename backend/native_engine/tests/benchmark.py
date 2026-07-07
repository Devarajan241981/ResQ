"""
Benchmarks the native_engine C functions against their pure-Python equivalents.
Run from backend/: `python native_engine/tests/benchmark.py`
Requires the library to already be built (see native_engine/README.md).
"""
import hashlib
import os
import random
import sys
import time
import tracemalloc
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from apps.common import native  # noqa: E402
from apps.common.geo import haversine_km as py_haversine_km  # noqa: E402

N_HAVERSINE = 200_000
N_BATCH_POINTS = 50_000
N_SHA256 = 50_000


def timed(label: str, fn):
    tracemalloc.start()
    start = time.perf_counter()
    fn()
    elapsed = time.perf_counter() - start
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    print(f"{label:45s} {elapsed:8.4f}s   peak_mem={peak / 1024:8.1f} KB")
    return elapsed


def bench_haversine():
    pairs = [
        (random.uniform(-90, 90), random.uniform(-180, 180), random.uniform(-90, 90), random.uniform(-180, 180))
        for _ in range(N_HAVERSINE)
    ]

    def run_python():
        for lat1, lng1, lat2, lng2 in pairs:
            py_haversine_km(lat1, lng1, lat2, lng2)

    def run_native():
        for lat1, lng1, lat2, lng2 in pairs:
            native.haversine_km(lat1, lng1, lat2, lng2)

    t_py = timed(f"haversine_km  x{N_HAVERSINE} (Python)", run_python)
    t_native = timed(f"haversine_km  x{N_HAVERSINE} (native)", run_native)
    print(f"  -> speedup: {t_py / t_native:.1f}x\n")


def bench_radius_filter_batch():
    points = [(random.uniform(-90, 90), random.uniform(-180, 180)) for _ in range(N_BATCH_POINTS)]
    origin = (12.9716, 77.5946)

    def run_python():
        [py_haversine_km(origin[0], origin[1], lat, lng) <= 10 for lat, lng in points]

    def run_native():
        native.radius_filter_batch(origin[0], origin[1], 10, points)

    t_py = timed(f"radius_filter_batch  x{N_BATCH_POINTS} (Python)", run_python)
    t_native = timed(f"radius_filter_batch  x{N_BATCH_POINTS} (native)", run_native)
    print(f"  -> speedup: {t_py / t_native:.1f}x\n")


def bench_sha256():
    payloads = [os.urandom(256) for _ in range(N_SHA256)]

    def run_python():
        for p in payloads:
            hashlib.sha256(p).hexdigest()

    def run_native():
        for p in payloads:
            native.sha256_hex(p)

    t_py = timed(f"sha256_hex  x{N_SHA256} (Python/hashlib)", run_python)
    t_native = timed(f"sha256_hex  x{N_SHA256} (native/OpenSSL)", run_native)
    print(f"  -> speedup: {t_py / t_native:.1f}x\n")


if __name__ == "__main__":
    print(f"native engine available: {native.is_available()}\n")
    if not native.is_available():
        print("Build native_engine first — see native_engine/README.md")
        sys.exit(1)

    bench_haversine()
    bench_radius_filter_batch()
    bench_sha256()

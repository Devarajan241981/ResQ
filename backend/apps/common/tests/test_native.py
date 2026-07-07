import math

import pytest

from apps.common import native
from apps.common.geo import haversine_km as py_haversine_km

pytestmark = pytest.mark.skipif(not native.is_available(), reason="native_engine not built for this platform")

BENGALURU = (12.9716, 77.5946)
DELHI = (28.6139, 77.2090)


def test_haversine_matches_python_implementation():
    native_result = native.haversine_km(*BENGALURU, *DELHI)
    python_result = py_haversine_km(*BENGALURU, *DELHI)
    assert math.isclose(native_result, python_result, rel_tol=1e-9)


def test_radius_filter_batch_matches_pointwise_check():
    points = [BENGALURU, DELHI, (12.9352, 77.6146), (19.0760, 72.8777)]
    mask = native.radius_filter_batch(BENGALURU[0], BENGALURU[1], 20, points)
    expected = [py_haversine_km(BENGALURU[0], BENGALURU[1], lat, lng) <= 20 for lat, lng in points]
    assert mask == expected
    assert mask[0] is True  # Bengaluru is trivially within 20km of itself


def test_point_in_polygon_simple_square():
    square = [(0, 0), (0, 10), (10, 10), (10, 0)]
    assert native.point_in_polygon(5, 5, square) is True
    assert native.point_in_polygon(15, 15, square) is False


def test_sha256_hex_matches_hashlib():
    import hashlib

    data = b"resq india emergency platform"
    assert native.sha256_hex(data) == hashlib.sha256(data).hexdigest()


def test_random_token_hex_is_correct_length_and_varies():
    token_a = native.random_token_hex(16)
    token_b = native.random_token_hex(16)
    assert len(token_a) == 32
    assert token_a != token_b


def test_generate_qr_png_writes_a_file(tmp_path):
    output = tmp_path / "test_qr.png"
    ok = native.generate_qr_png("https://resq.example.com/share/abc123", str(output), scale=4)
    assert ok is True
    assert output.exists()
    assert output.stat().st_size > 0

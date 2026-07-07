import math

EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two points in kilometres."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def filter_within_radius(queryset, lat: float, lng: float, radius_km: float):
    """Bounding-box pre-filter (cheap, indexable) then exact haversine cutoff (precise)."""
    from apps.common.models import GeoLocationMixin

    lat_min, lat_max, lng_min, lng_max = GeoLocationMixin.bounding_box(lat, lng, radius_km)
    candidates = queryset.filter(
        latitude__gte=lat_min,
        latitude__lte=lat_max,
        longitude__gte=lng_min,
        longitude__lte=lng_max,
    )
    return [
        obj
        for obj in candidates
        if obj.latitude is not None
        and obj.longitude is not None
        and haversine_km(lat, lng, float(obj.latitude), float(obj.longitude)) <= radius_km
    ]

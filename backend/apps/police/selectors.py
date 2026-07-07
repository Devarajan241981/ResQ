from apps.common.geo import filter_within_radius
from apps.police.models import PoliceStation


def get_nearby_stations(lat: float, lng: float, radius_km: float):
    return filter_within_radius(PoliceStation.objects.filter(is_active=True), lat, lng, radius_km)

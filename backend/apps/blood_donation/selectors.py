"""Read-only queries for blood_donation. No mutation happens here — see services.py for writes."""
from apps.common.geo import filter_within_radius
from apps.blood_donation.models import DonorProfile


def get_nearby_available_donors(queryset, lat: float, lng: float, radius_km: float):
    qs = queryset.filter(is_available=True)
    return filter_within_radius(qs, lat, lng, radius_km)


def get_donors_for_request(blood_group: str, city: str | None, lat: float | None, lng: float | None, radius_km: float):
    donors = DonorProfile.objects.filter(blood_group=blood_group, is_available=True).select_related("user")
    if lat is not None and lng is not None:
        return filter_within_radius(donors, lat, lng, radius_km)
    if city:
        return list(donors.filter(city__iexact=city))
    return list(donors)

"""
Server-side proxy for OpenRouteService (geocoding + routing). Kept server-side so the
ORS API key never reaches the Leaflet/OSM frontend. No business logic lives here —
just a thin, swappable HTTP client.
"""
import requests
from django.conf import settings

from apps.common.exceptions import DomainError


class MapsProviderError(DomainError):
    default_message = "Map service is temporarily unavailable."
    status_code = 502


class MapsNotConfiguredError(DomainError):
    default_message = "Map service is not configured on this server."
    status_code = 501


def _headers() -> dict:
    if not settings.ORS_API_KEY:
        raise MapsNotConfiguredError()
    return {"Authorization": settings.ORS_API_KEY}


def geocode(query: str) -> list[dict]:
    try:
        resp = requests.get(
            f"{settings.ORS_BASE_URL}/geocode/search",
            params={"text": query, "boundary.country": "IN"},
            headers=_headers(),
            timeout=5,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise MapsProviderError() from exc
    return resp.json().get("features", [])


def get_route(start_lng: float, start_lat: float, end_lng: float, end_lat: float, profile: str = "driving-car") -> dict:
    try:
        resp = requests.post(
            f"{settings.ORS_BASE_URL}/v2/directions/{profile}/geojson",
            json={"coordinates": [[start_lng, start_lat], [end_lng, end_lat]]},
            headers={**_headers(), "Content-Type": "application/json"},
            timeout=8,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise MapsProviderError() from exc
    return resp.json()

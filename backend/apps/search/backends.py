"""
Pluggable full-text search. PostgresSearchBackend is the real default (icontains
across the report tables); swap settings.SEARCH_BACKEND for an Elasticsearch/OpenSearch
implementation later without touching apps.search.views or callers.
"""
from abc import ABC, abstractmethod


class SearchBackend(ABC):
    @abstractmethod
    def search(self, query: str, limit: int = 20) -> list[dict]:
        """Return a normalized list of {type, id, title, subtitle, status} hits."""


class PostgresSearchBackend(SearchBackend):
    def search(self, query: str, limit: int = 20) -> list[dict]:
        from apps.lost_pets.models import LostPetReport
        from apps.missing_children.models import MissingChildReport
        from apps.missing_elderly.models import MissingElderlyReport
        from apps.missing_persons.models import MissingPersonReport

        results: list[dict] = []

        for report in MissingPersonReport.objects.filter(name__icontains=query)[:limit]:
            results.append(
                {
                    "type": "missing_person",
                    "id": str(report.id),
                    "title": report.name,
                    "subtitle": report.last_seen_location,
                    "status": report.status,
                }
            )
        for report in MissingChildReport.objects.filter(name__icontains=query)[:limit]:
            results.append(
                {
                    "type": "missing_child",
                    "id": str(report.id),
                    "title": report.name,
                    "subtitle": report.last_seen_location,
                    "status": report.status,
                }
            )
        for report in MissingElderlyReport.objects.filter(name__icontains=query)[:limit]:
            results.append(
                {
                    "type": "missing_elderly",
                    "id": str(report.id),
                    "title": report.name,
                    "subtitle": report.last_seen_location,
                    "status": report.status,
                }
            )
        for report in LostPetReport.objects.filter(pet_name__icontains=query)[:limit]:
            results.append(
                {
                    "type": "lost_pet",
                    "id": str(report.id),
                    "title": report.pet_name or report.species,
                    "subtitle": report.last_seen_location,
                    "status": report.status,
                }
            )

        return results[:limit]


def get_backend() -> SearchBackend:
    return PostgresSearchBackend()

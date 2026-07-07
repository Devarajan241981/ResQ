"""Write-path business logic for missing_persons. Views call these instead of touching models directly."""
import io
from decimal import Decimal

import qrcode
from django.conf import settings
from django.core.files.base import ContentFile

from apps.missing_persons.models import (
    EmergencyContact,
    MissingPersonPhoto,
    MissingPersonReport,
    SightingReport,
)


def public_share_url(report: MissingPersonReport) -> str:
    return f"{settings.FRONTEND_BASE_URL}/missing-persons/{report.public_slug}"


def generate_qr_code(report: MissingPersonReport) -> None:
    """Encodes the public share link into a QR PNG and attaches it to the report."""
    img = qrcode.make(public_share_url(report))
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    report.qr_code.save(f"{report.public_slug}.png", ContentFile(buffer.getvalue()), save=True)


def compute_risk_score(report: MissingPersonReport) -> Decimal:
    """
    Rule-based placeholder for the "risk scoring for suspicious reports" AI feature.
    Flags reports that look incomplete or inconsistent so moderators can triage them first.
    Replace with a trained classifier once labeled report data is available (see apps.ai_matching).
    """
    from django.utils import timezone

    score = Decimal("0")

    if not report.photos.exists():
        score += Decimal("3")
    if not report.emergency_contacts.exists():
        score += Decimal("2")
    if report.last_seen_at and report.last_seen_at > timezone.now():
        score += Decimal("4")  # last seen in the future is inconsistent
    if report.age is not None and report.age > 120:
        score += Decimal("3")
    if not report.clothing_description:
        score += Decimal("1")

    return min(score, Decimal("10"))


def create_report(reported_by, validated_data: dict, contacts_data: list[dict], photo_files: list) -> MissingPersonReport:
    """Orchestrates report creation: persists the report + nested contacts/photos, then scores + QR-codes it."""
    report = MissingPersonReport.objects.create(reported_by=reported_by, **validated_data)

    for contact in contacts_data:
        EmergencyContact.objects.create(report=report, **contact)

    for photo in photo_files:
        MissingPersonPhoto.objects.create(report=report, image=photo)

    report.risk_score = compute_risk_score(report)
    report.save(update_fields=["risk_score"])
    generate_qr_code(report)
    return report


def add_photo(report: MissingPersonReport, image_file) -> MissingPersonPhoto:
    return MissingPersonPhoto.objects.create(report=report, image=image_file)


def add_sighting(report: MissingPersonReport, reported_by, validated_data: dict) -> SightingReport:
    return SightingReport.objects.create(report=report, reported_by=reported_by, **validated_data)


def update_status(report: MissingPersonReport, new_status: str) -> MissingPersonReport:
    report.status = new_status
    report.save(update_fields=["status"])
    return report


__all__ = [
    "public_share_url",
    "generate_qr_code",
    "compute_risk_score",
    "create_report",
    "add_photo",
    "add_sighting",
    "update_status",
]


import io
from decimal import Decimal

import qrcode
from django.conf import settings
from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone

from apps.missing_persons.models import (
    EmergencyContact,
    MissingPersonPhoto,
    MissingPersonReport,
    ReportComment,
    SightingReport,
)
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_user


def public_share_url(report: MissingPersonReport) -> str:
    """Return the public URL for a missing-person report."""
    return f"{settings.FRONTEND_BASE_URL}/missing-persons/{report.public_slug}"


def generate_qr_code(report: MissingPersonReport) -> None:
    """Generate a QR code for the report's public share URL."""
    img = qrcode.make(public_share_url(report))

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")

    report.qr_code.save(
        f"{report.public_slug}.png",
        ContentFile(buffer.getvalue()),
        save=True,
    )


def compute_risk_score(report: MissingPersonReport) -> Decimal:
    """
    Calculate a rule-based risk score for a missing-person report.

    Reports with missing information or inconsistent data receive
    additional risk points. The score is capped at 10.
    """
    score = Decimal("0")

    if not report.photos.exists():
        score += Decimal("3")

    if not report.emergency_contacts.exists():
        score += Decimal("2")

    if report.last_seen_at and report.last_seen_at > timezone.now():
        score += Decimal("4")

    if report.age is not None and report.age > 120:
        score += Decimal("3")

    if not report.clothing_description:
        score += Decimal("1")

    return min(score, Decimal("10"))


def create_report(
    reported_by,
    validated_data: dict,
    contacts_data: list[dict],
    photo_files: list,
) -> MissingPersonReport:
    """
    Create a missing-person report with contacts and photos.

    After creation, calculate the risk score and generate the QR code.
    """
    report = MissingPersonReport.objects.create(
        reported_by=reported_by,
        **validated_data,
    )

    for contact in contacts_data:
        EmergencyContact.objects.create(
            report=report,
            **contact,
        )

    for photo in photo_files:
        MissingPersonPhoto.objects.create(
            report=report,
            image=photo,
        )

    report.risk_score = compute_risk_score(report)
    report.save(update_fields=["risk_score"])

    generate_qr_code(report)

    return report


def add_photo(
    report: MissingPersonReport,
    image_file,
) -> MissingPersonPhoto:
    """Add a photo to an existing missing-person report."""
    return MissingPersonPhoto.objects.create(
        report=report,
        image=image_file,
    )


def add_sighting(
    report: MissingPersonReport,
    reported_by,
    validated_data: dict,
) -> SightingReport:
    """Create a sighting and notify the original reporter after commit."""
    sighting = SightingReport.objects.create(
        report=report,
        reported_by=reported_by,
        **validated_data,
    )

    transaction.on_commit(
        lambda: notify_user(
            recipient=report.reported_by,
            notification_type=NotificationType.MISSING_PERSON_ALERT,
            title=f"Possible sighting of {report.name}",
            body=(
                validated_data.get("location_text")
                or validated_data.get("description", "")[:140]
            ),
            data={
                "report_id": str(report.id),
                "public_slug": report.public_slug,
                "kind": "sighting",
            },
        )
    )

    return sighting


def update_status(
    report: MissingPersonReport,
    new_status: str,
) -> MissingPersonReport:
    """Update the status of a missing-person report."""
    report.status = new_status
    report.save(update_fields=["status"])

    return report


def add_comment(
    report: MissingPersonReport,
    author,
    content: str,
) -> ReportComment:
    """Add a comment and notify the report owner when appropriate."""
    comment = ReportComment.objects.create(
        report=report,
        author=author,
        content=content,
    )

    if author.id != report.reported_by_id:
        transaction.on_commit(
            lambda: notify_user(
                recipient=report.reported_by,
                notification_type=NotificationType.SYSTEM,
                title=f"New comment on {report.name}'s post",
                body=content[:140],
                data={
                    "report_id": str(report.id),
                    "public_slug": report.public_slug,
                    "kind": "comment",
                },
            )
        )

    return comment


__all__ = [
    "public_share_url",
    "generate_qr_code",
    "compute_risk_score",
    "create_report",
    "add_photo",
    "add_sighting",
    "update_status",
    "add_comment",
]

from django.contrib import admin

from apps.missing_persons.models import (
    EmergencyContact,
    MissingPersonPhoto,
    MissingPersonReport,
    SightingReport,
)


class MissingPersonPhotoInline(admin.TabularInline):
    model = MissingPersonPhoto
    extra = 0


class EmergencyContactInline(admin.TabularInline):
    model = EmergencyContact
    extra = 0


class SightingReportInline(admin.TabularInline):
    model = SightingReport
    extra = 0


@admin.register(MissingPersonReport)
class MissingPersonReportAdmin(admin.ModelAdmin):
    list_display = ("name", "age", "gender", "status", "risk_score", "reported_by", "created_at")
    list_filter = ("status", "gender")
    search_fields = ("name", "public_slug", "last_seen_location")
    readonly_fields = ("public_slug", "qr_code", "risk_score", "ai_summary")
    inlines = [MissingPersonPhotoInline, EmergencyContactInline, SightingReportInline]

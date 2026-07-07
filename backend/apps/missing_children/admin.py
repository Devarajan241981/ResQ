from django.contrib import admin

from apps.missing_children.models import MissingChildReport


@admin.register(MissingChildReport)
class MissingChildReportAdmin(admin.ModelAdmin):
    list_display = ("name", "age", "status", "is_extra_verified", "priority_alert_sent", "created_at")
    list_filter = ("status", "is_extra_verified")
    search_fields = ("name", "guardian_name", "last_seen_location")

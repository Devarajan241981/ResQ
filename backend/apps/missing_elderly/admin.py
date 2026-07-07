from django.contrib import admin

from apps.missing_elderly.models import MissingElderlyReport


@admin.register(MissingElderlyReport)
class MissingElderlyReportAdmin(admin.ModelAdmin):
    list_display = ("name", "age", "status", "has_dementia", "has_alzheimers", "created_at")
    list_filter = ("status", "has_dementia", "has_alzheimers")
    search_fields = ("name", "last_seen_location")

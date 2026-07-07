from django.contrib import admin

from apps.police.models import CaseForwardRecord, PoliceStation


@admin.register(PoliceStation)
class PoliceStationAdmin(admin.ModelAdmin):
    list_display = ("name", "station_code", "city", "is_active")
    list_filter = ("city", "is_active")
    search_fields = ("name", "station_code", "jurisdiction_area")


@admin.register(CaseForwardRecord)
class CaseForwardRecordAdmin(admin.ModelAdmin):
    list_display = ("police_station", "report_type", "status", "reference_number", "created_at")
    list_filter = ("report_type", "status")

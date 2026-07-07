from django.contrib import admin

from apps.disaster_mode.models import DisasterEvent, StatusReport, VolunteerAssignment


class StatusReportInline(admin.TabularInline):
    model = StatusReport
    extra = 0


@admin.register(DisasterEvent)
class DisasterEventAdmin(admin.ModelAdmin):
    list_display = ("name", "disaster_type", "status", "affected_area", "started_at")
    list_filter = ("disaster_type", "status")
    search_fields = ("name", "affected_area")
    inlines = [StatusReportInline]


@admin.register(StatusReport)
class StatusReportAdmin(admin.ModelAdmin):
    list_display = ("event", "user", "need_type", "is_resolved", "created_at")
    list_filter = ("need_type", "is_resolved")


@admin.register(VolunteerAssignment)
class VolunteerAssignmentAdmin(admin.ModelAdmin):
    list_display = ("event", "volunteer", "status", "assigned_at", "completed_at")
    list_filter = ("status",)

from django.contrib import admin

from apps.sos.models import SOSAlert, SOSLocationPing, TrustedContact


class SOSLocationPingInline(admin.TabularInline):
    model = SOSLocationPing
    extra = 0
    readonly_fields = ("latitude", "longitude", "recorded_at")


@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "latitude", "longitude", "created_at", "resolved_at")
    list_filter = ("status",)
    search_fields = ("user__full_name", "user__phone")
    inlines = [SOSLocationPingInline]


@admin.register(TrustedContact)
class TrustedContactAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "phone", "relationship")
    search_fields = ("user__full_name", "name", "phone")

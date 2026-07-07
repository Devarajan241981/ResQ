from django.contrib import admin

from apps.ambulance.models import AmbulanceRequest


@admin.register(AmbulanceRequest)
class AmbulanceRequestAdmin(admin.ModelAdmin):
    list_display = ("requested_by", "status", "hospital", "created_at")
    list_filter = ("status",)

from django.contrib import admin

from apps.shelters.models import Shelter


@admin.register(Shelter)
class ShelterAdmin(admin.ModelAdmin):
    list_display = ("name", "shelter_type", "city", "capacity", "current_occupancy", "is_active")
    list_filter = ("shelter_type", "city", "is_active")
    search_fields = ("name", "city")

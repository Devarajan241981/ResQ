from django.contrib import admin

from apps.lost_pets.models import LostPetReport


@admin.register(LostPetReport)
class LostPetReportAdmin(admin.ModelAdmin):
    list_display = ("pet_name", "species", "status", "reward_amount", "created_at")
    list_filter = ("status", "species")
    search_fields = ("pet_name", "breed", "last_seen_location")

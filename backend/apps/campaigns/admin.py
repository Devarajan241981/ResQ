from django.contrib import admin

from apps.campaigns.models import Campaign, CampaignRegistration


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "city", "status", "starts_at", "organizer")
    list_filter = ("category", "status", "city")
    search_fields = ("title", "city")


@admin.register(CampaignRegistration)
class CampaignRegistrationAdmin(admin.ModelAdmin):
    list_display = ("full_name", "campaign", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("full_name", "phone", "email")

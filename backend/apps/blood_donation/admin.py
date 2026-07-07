from django.contrib import admin

from apps.blood_donation.models import BloodRequest, BloodRequestResponse, DonorProfile


class BloodRequestResponseInline(admin.TabularInline):
    model = BloodRequestResponse
    extra = 0


@admin.register(DonorProfile)
class DonorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "blood_group", "city", "is_available", "last_donated_at")
    list_filter = ("blood_group", "city", "is_available")
    search_fields = ("user__full_name", "city")


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ("patient_name", "blood_group", "city", "urgency", "status", "created_at")
    list_filter = ("blood_group", "urgency", "status", "city")
    search_fields = ("patient_name", "city")
    inlines = [BloodRequestResponseInline]

from django.contrib import admin

from apps.hospitals.models import Hospital


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("name", "hospital_type", "city", "is_verified", "has_blood_bank", "has_trauma_center")
    list_filter = ("hospital_type", "city", "is_verified", "has_blood_bank")
    search_fields = ("name", "city", "pincode")

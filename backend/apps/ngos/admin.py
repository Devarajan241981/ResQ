from django.contrib import admin

from apps.ngos.models import NGOProfile


@admin.register(NGOProfile)
class NGOProfileAdmin(admin.ModelAdmin):
    list_display = ("org_name", "city", "is_verified", "registration_number")
    list_filter = ("is_verified", "city")
    search_fields = ("org_name", "registration_number")

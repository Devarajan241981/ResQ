from django.contrib import admin

from apps.organizations.models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "org_type", "city", "is_verified")
    list_filter = ("org_type", "is_verified", "city")
    search_fields = ("name", "registration_number")

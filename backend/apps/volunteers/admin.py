from django.contrib import admin

from apps.volunteers.models import VolunteerProfile


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "is_verified", "is_available", "reputation_score", "completed_tasks")
    list_filter = ("is_verified", "is_available")
    search_fields = ("user__full_name", "user__email")

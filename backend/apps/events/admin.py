from django.contrib import admin

from apps.events.models import Event, EventRSVP


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "event_date", "city", "created_by")
    list_filter = ("category", "event_date")
    search_fields = ("title", "city", "location")


@admin.register(EventRSVP)
class EventRSVPAdmin(admin.ModelAdmin):
    list_display = ("event", "user", "created_at")

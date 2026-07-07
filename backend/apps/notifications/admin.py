from django.contrib import admin

from apps.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("notification_type", "recipient", "channel", "is_read", "sent_at", "created_at")
    list_filter = ("notification_type", "channel", "is_read")
    search_fields = ("title", "recipient__full_name", "recipient__email")

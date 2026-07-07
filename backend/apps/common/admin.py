from django.contrib import admin

from apps.common.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "actor", "status_code", "created_at")
    list_filter = ("method", "status_code")
    search_fields = ("action", "path", "request_id")
    readonly_fields = [f.name for f in AuditLog._meta.fields]
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from apps.accounts.models import DeviceSession, OTPRequest, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ("-date_joined",)
    list_display = ("full_name", "email", "phone", "role", "is_verified", "is_active", "date_joined")
    list_filter = ("role", "is_verified", "is_active", "is_staff")
    search_fields = ("full_name", "email", "phone")
    fieldsets = (
        (None, {"fields": ("email", "phone", "password")}),
        ("Profile", {"fields": ("full_name", "role", "preferred_language", "profile_photo")}),
        ("Status", {"fields": ("is_verified", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "phone", "full_name", "password1", "password2", "role")}),
    )


@admin.register(OTPRequest)
class OTPRequestAdmin(admin.ModelAdmin):
    list_display = ("phone", "purpose", "is_used", "attempts", "expires_at", "created_at")
    list_filter = ("purpose", "is_used")
    readonly_fields = ("code_hash",)


@admin.register(DeviceSession)
class DeviceSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "device_name", "is_active", "created_at", "last_used_at")
    list_filter = ("is_active",)
    search_fields = ("user__full_name", "user__email", "device_name")
    readonly_fields = ("refresh_jti",)

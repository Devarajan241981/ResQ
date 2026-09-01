from django.contrib import admin

from apps.community.models import Community, CommunityMembership, CommunityPost, CommunityPostLike


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "city", "is_active", "created_at")
    list_filter = ("is_active", "city")
    search_fields = ("name", "city")


@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ("community", "author", "created_at")
    search_fields = ("content",)


admin.site.register(CommunityMembership)
admin.site.register(CommunityPostLike)

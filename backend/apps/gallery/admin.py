from django.contrib import admin

from apps.gallery.models import GalleryImage


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ("id", "uploaded_by", "caption", "created_at")
    search_fields = ("caption", "uploaded_by__full_name")

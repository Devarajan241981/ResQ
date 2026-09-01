from rest_framework.routers import DefaultRouter

from apps.gallery.views import GalleryImageViewSet

app_name = "gallery"

router = DefaultRouter()
router.register("images", GalleryImageViewSet, basename="gallery-image")

urlpatterns = router.urls

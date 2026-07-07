from django.apps import AppConfig


class DisasterModeConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.disaster_mode"
    verbose_name = "Disaster Mode"

    def ready(self):
        from apps.disaster_mode import signals  # noqa: F401

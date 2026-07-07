from django.apps import AppConfig


class MissingPersonsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.missing_persons"
    verbose_name = "Missing Persons"

    def ready(self):
        from apps.missing_persons import signals  # noqa: F401

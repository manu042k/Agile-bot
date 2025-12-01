from django.apps import AppConfig


class ProjectapisConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "projectApis"

    def ready(self):
        """
        Import signals when the app is ready
        """
        import projectApis.signals  # noqa

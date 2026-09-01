from django.db import migrations


def forwards(apps, schema_editor):
    """Rebrand existing welcome notifications and tag them so the client can
    deep-link them to the phone-verification page."""
    Notification = apps.get_model("notifications", "Notification")
    for notif in Notification.objects.filter(title="Welcome to ResQ India"):
        notif.title = "Welcome to ResQ Bharath"
        data = notif.data or {}
        data.setdefault("action", "verify_phone")
        notif.data = data
        notif.save(update_fields=["title", "data"])


def backwards(apps, schema_editor):
    Notification = apps.get_model("notifications", "Notification")
    Notification.objects.filter(title="Welcome to ResQ Bharath").update(title="Welcome to ResQ India")


class Migration(migrations.Migration):
    dependencies = [
        ("notifications", "0004_alter_notification_notification_type"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]

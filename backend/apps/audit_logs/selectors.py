from apps.audit_logs.models import AuditLog


def get_recent_logs(actor_id=None, action: str | None = None):
    qs = AuditLog.objects.select_related("actor")
    if actor_id:
        qs = qs.filter(actor_id=actor_id)
    if action:
        qs = qs.filter(action__icontains=action)
    return qs

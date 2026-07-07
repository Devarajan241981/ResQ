"""Read-only queries for sos. No mutation happens here — see services.py for writes."""
from apps.sos.models import SOSAlert, TrustedContact


def get_trusted_contacts_for(user):
    return TrustedContact.objects.filter(user=user)


def get_alerts_for(user):
    return SOSAlert.objects.filter(user=user).prefetch_related("pings")

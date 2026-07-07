"""Read-only queries for accounts. No mutation happens here — see services/ for writes."""
from django.contrib.auth import get_user_model

User = get_user_model()


def get_user_by_email(email: str):
    return User.objects.filter(email__iexact=email).first()


def get_user_by_phone(phone: str):
    return User.objects.filter(phone=phone).first()

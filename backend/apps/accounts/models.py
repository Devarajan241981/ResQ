import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField


class Gender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"
    OTHER = "other", "Other"


class Role(models.TextChoices):
    CITIZEN = "citizen", "Citizen"
    VOLUNTEER = "volunteer", "Volunteer"
    NGO = "ngo", "NGO"
    HOSPITAL = "hospital", "Hospital"
    POLICE = "police", "Police"  # reserved for future integration
    ADMIN = "admin", "Admin"
    SUPER_ADMIN = "super_admin", "Super Admin"


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email=None, phone=None, password=None, **extra_fields):
        if not email and not phone:
            raise ValueError("A user requires an email or a phone number.")
        email = self.normalize_email(email) if email else None
        user = self.model(email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, phone=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, phone, password, **extra_fields)

    def create_superuser(self, email=None, phone=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.SUPER_ADMIN)
        extra_fields.setdefault("is_verified", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = PhoneNumberField(unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CITIZEN)

    is_verified = models.BooleanField(
        default=False, help_text="Verified via OTP/Google or manual admin review."
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    preferred_language = models.CharField(max_length=10, default="en")
    profile_photo = models.ImageField(upload_to="profiles/", null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)

    google_sub = models.CharField(max_length=255, blank=True, unique=False, null=True)

    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        indexes = [
            models.Index(fields=["role"]),
            models.Index(fields=["phone"]),
        ]

    def __str__(self):
        return self.full_name or str(self.email or self.phone)

    @property
    def is_admin_role(self) -> bool:
        return self.role in (Role.ADMIN, Role.SUPER_ADMIN)


class OTPPurpose(models.TextChoices):
    LOGIN = "login", "Login"
    PHONE_VERIFICATION = "phone_verification", "Phone Verification"
    PASSWORD_RESET = "password_reset", "Password Reset"


class OTPRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = PhoneNumberField()
    code_hash = models.CharField(max_length=128)
    purpose = models.CharField(max_length=30, choices=OTPPurpose.choices, default=OTPPurpose.LOGIN)
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["phone", "purpose", "is_used"])]

    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at


class DeviceSession(models.Model):
    """
    One row per issued refresh token, so a user can see/revoke sessions across devices.
    refresh_jti correlates to rest_framework_simplejwt's OutstandingToken for blacklisting.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="device_sessions")
    refresh_jti = models.CharField(max_length=255, unique=True)
    device_id = models.CharField(max_length=255, blank=True)
    device_name = models.CharField(max_length=150, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-last_used_at"]
        indexes = [models.Index(fields=["user", "is_active"])]

from django.contrib.auth import get_user_model

User = get_user_model()


def register_user(validated_data: dict) -> User:
    """
    Creates the account, then wires the optional signup extras into the apps
    that actually own them: a blood group selected during signup creates a
    DonorProfile (blood_donation is the source of truth for donor data, not
    a duplicate field on User) rather than being silently discarded.
    """
    password = validated_data.pop("password")
    blood_group = validated_data.pop("blood_group", None)
    city = validated_data.get("city", "")

    user = User(**validated_data)
    user.set_password(password)
    user.save()

    if blood_group:
        from apps.blood_donation.models import DonorProfile

        DonorProfile.objects.create(user=user, blood_group=blood_group, city=city, is_available=True)

    return user

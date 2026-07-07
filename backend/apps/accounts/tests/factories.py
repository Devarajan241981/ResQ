import factory

from apps.accounts.models import Role, User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    full_name = factory.Faker("name")
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    phone = factory.Sequence(lambda n: f"+9198765{n:05d}")
    role = Role.CITIZEN
    is_verified = True

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        obj.set_password(extracted or "StrongPass123!")
        if create:
            obj.save()

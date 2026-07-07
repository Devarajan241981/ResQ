from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = "Seeds the database with demo data for local development and manual QA. Idempotent."

    def handle(self, *args, **options):
        from apps.accounts.models import Role, User
        from apps.blood_donation.models import BloodGroup, BloodRequest, DonorProfile, Urgency
        from apps.disaster_mode.models import DisasterEvent, DisasterType, NeedType, StatusReport
        from apps.hospitals.models import Hospital, HospitalType
        from apps.missing_persons.models import Gender, MissingPersonReport
        from apps.missing_persons.services import compute_risk_score, generate_qr_code
        from apps.police.models import PoliceStation
        from apps.shelters.models import Shelter, ShelterType
        from apps.sos.models import TrustedContact
        from apps.volunteers.models import Skill, VolunteerProfile

        def user(email, phone, full_name, role, **extra):
            defaults = {"full_name": full_name, "phone": phone, "role": role, "is_verified": True, **extra}
            obj, created = User.objects.get_or_create(email=email, defaults=defaults)
            if created:
                obj.set_password("DemoPass123!")
                obj.save()
            return obj

        super_admin = user(
            "superadmin@resq.example", "+919800000001", "Super Admin", Role.SUPER_ADMIN,
            is_staff=True, is_superuser=True,
        )
        admin = user("admin@resq.example", "+919800000002", "Platform Admin", Role.ADMIN, is_staff=True)
        citizen = user("citizen@resq.example", "+919800000003", "Asha Citizen", Role.CITIZEN)
        volunteer_user = user("volunteer@resq.example", "+919800000004", "Vikram Volunteer", Role.VOLUNTEER)
        ngo_user = user("ngo@resq.example", "+919800000005", "NGO Coordinator", Role.NGO)
        hospital_user = user("hospital@resq.example", "+919800000006", "Hospital Admin", Role.HOSPITAL)

        VolunteerProfile.objects.get_or_create(
            user=volunteer_user,
            defaults={
                "skills": [Skill.MEDICAL, Skill.SEARCH_RESCUE],
                "is_verified": True,
                "is_available": True,
                "latitude": "12.9716",
                "longitude": "77.5946",
            },
        )

        hospital = Hospital.objects.get_or_create(
            name="Bengaluru General Hospital",
            defaults={
                "hospital_type": HospitalType.GOVERNMENT,
                "address": "1 Hospital Road, Bengaluru",
                "city": "Bengaluru",
                "state": "Karnataka",
                "phone": "+918022222222",
                "emergency_phone": "+918022222233",
                "has_blood_bank": True,
                "has_trauma_center": True,
                "is_verified": True,
                "managed_by": hospital_user,
                "latitude": "12.9716",
                "longitude": "77.5946",
            },
        )[0]

        Shelter.objects.get_or_create(
            name="Koramangala Community Shelter",
            defaults={
                "shelter_type": ShelterType.NGO,
                "address": "5th Block, Koramangala, Bengaluru",
                "city": "Bengaluru",
                "capacity": 200,
                "current_occupancy": 40,
                "contact_phone": "+918033333333",
                "managed_by": ngo_user,
                "latitude": "12.9352",
                "longitude": "77.6146",
            },
        )

        PoliceStation.objects.get_or_create(
            station_code="BLR-KOR-01",
            defaults={
                "name": "Koramangala Police Station",
                "jurisdiction_area": "Koramangala & HSR Layout",
                "address": "80 Feet Road, Koramangala, Bengaluru",
                "city": "Bengaluru",
                "phone": "+918044444444",
                "latitude": "12.9352",
                "longitude": "77.6146",
            },
        )

        DonorProfile.objects.get_or_create(
            user=citizen,
            defaults={
                "blood_group": BloodGroup.O_POS,
                "city": "Bengaluru",
                "is_available": True,
                "latitude": "12.9716",
                "longitude": "77.5946",
            },
        )

        BloodRequest.objects.get_or_create(
            patient_name="Demo Patient",
            defaults={
                "requested_by": hospital_user,
                "blood_group": BloodGroup.O_POS,
                "units_needed": 3,
                "hospital": hospital,
                "city": "Bengaluru",
                "urgency": Urgency.CRITICAL,
                "notes": "Emergency surgery, O+ blood needed urgently.",
                "latitude": "12.9716",
                "longitude": "77.5946",
            },
        )

        event, _ = DisasterEvent.objects.get_or_create(
            name="Demo Bengaluru Flood",
            defaults={
                "disaster_type": DisasterType.FLOOD,
                "description": "Seasonal flooding in low-lying areas.",
                "affected_area": "Koramangala, HSR Layout",
                "radius_km": 15,
                "started_at": timezone.now() - timedelta(hours=6),
                "created_by": admin,
                "latitude": "12.9352",
                "longitude": "77.6146",
            },
        )
        StatusReport.objects.get_or_create(
            event=event,
            user=citizen,
            need_type=NeedType.NEED_WATER,
            defaults={"notes": "Out of drinking water since this morning.", "latitude": "12.9352", "longitude": "77.6146"},
        )

        TrustedContact.objects.get_or_create(user=citizen, phone="+919800000099", defaults={"name": "Emergency Contact"})

        report, created = MissingPersonReport.objects.get_or_create(
            name="Demo Missing Person",
            age=34,
            defaults={
                "reported_by": citizen,
                "gender": Gender.MALE,
                "last_seen_location": "MG Road, Bengaluru",
                "last_seen_at": timezone.now() - timedelta(days=1),
                "clothing_description": "Blue shirt, black trousers",
                "latitude": "12.9716",
                "longitude": "77.5946",
            },
        )
        if created:
            report.risk_score = compute_risk_score(report)
            report.save(update_fields=["risk_score"])
            generate_qr_code(report)

        self.stdout.write(self.style.SUCCESS("Demo data seeded."))
        self.stdout.write("Login with any of these (password: DemoPass123!):")
        for u in [super_admin, admin, citizen, volunteer_user, ngo_user, hospital_user]:
            self.stdout.write(f"  {u.email}  [{u.role}]")

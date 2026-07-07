# Entity-Relationship Diagram

Covers the fully-implemented modules (accounts, missing persons, SOS,
blood donation, disaster mode, and the supporting directories they depend
on). Scaffolded modules (missing children/elderly, lost pets, ambulance,
NGOs, organizations) are omitted here for readability — see their
`models.py` files directly; they follow the same `BaseModel` conventions.

Every entity below also has `id (UUID)`, `created_at`, `updated_at`,
`is_deleted`, `deleted_at`, `created_by (FK->User)`, `updated_by (FK->User)`
from `apps.common.models.BaseModel` — omitted from the diagram to keep it
readable.

```mermaid
erDiagram
    USER ||--o{ MISSING_PERSON_REPORT : reports
    USER ||--o{ SOS_ALERT : triggers
    USER ||--o{ TRUSTED_CONTACT : has
    USER ||--o| VOLUNTEER_PROFILE : "is a"
    USER ||--o| DONOR_PROFILE : "is a"
    USER ||--o{ BLOOD_REQUEST : requests
    USER ||--o{ DEVICE_SESSION : "logged in on"
    USER ||--o{ NOTIFICATION : receives

    MISSING_PERSON_REPORT ||--o{ MISSING_PERSON_PHOTO : has
    MISSING_PERSON_REPORT ||--o{ EMERGENCY_CONTACT : has
    MISSING_PERSON_REPORT ||--o{ SIGHTING_REPORT : has

    SOS_ALERT ||--o{ SOS_LOCATION_PING : "trail of"

    BLOOD_REQUEST ||--o{ BLOOD_REQUEST_RESPONSE : has
    BLOOD_REQUEST }o--o| HOSPITAL : "at (optional)"
    USER ||--o{ BLOOD_REQUEST_RESPONSE : offers

    DISASTER_EVENT ||--o{ STATUS_REPORT : has
    DISASTER_EVENT ||--o{ VOLUNTEER_ASSIGNMENT : has
    DISASTER_EVENT ||--o{ SHELTER : "spawns temporary"
    STATUS_REPORT ||--o| VOLUNTEER_ASSIGNMENT : "resolved by"
    USER ||--o{ STATUS_REPORT : submits
    USER ||--o{ VOLUNTEER_ASSIGNMENT : "assigned as volunteer"

    USER {
        uuid id PK
        string full_name
        string email UK
        string phone UK
        string role
        bool is_verified
        string preferred_language
    }

    MISSING_PERSON_REPORT {
        uuid id PK
        uuid reported_by FK
        string public_slug UK
        string name
        int age
        string gender
        string last_seen_location
        datetime last_seen_at
        string status
        decimal risk_score
        json face_embedding
    }

    SOS_ALERT {
        uuid id PK
        uuid user FK
        string status
        decimal latitude
        decimal longitude
    }

    TRUSTED_CONTACT {
        uuid id PK
        uuid user FK
        string name
        string phone
    }

    DONOR_PROFILE {
        uuid id PK
        uuid user FK UK
        string blood_group
        string city
        bool is_available
    }

    BLOOD_REQUEST {
        uuid id PK
        uuid requested_by FK
        uuid hospital FK
        string blood_group
        string urgency
        string status
    }

    DISASTER_EVENT {
        uuid id PK
        string disaster_type
        string status
        decimal radius_km
        datetime started_at
    }

    STATUS_REPORT {
        uuid id PK
        uuid event FK
        uuid user FK
        string need_type
        bool is_resolved
    }

    VOLUNTEER_PROFILE {
        uuid id PK
        uuid user FK UK
        string[] skills
        bool is_verified
        decimal reputation_score
    }

    HOSPITAL {
        uuid id PK
        string name
        string hospital_type
        string city
        bool has_blood_bank
    }

    SHELTER {
        uuid id PK
        string name
        string shelter_type
        int capacity
        int current_occupancy
    }

    DEVICE_SESSION {
        uuid id PK
        uuid user FK
        string refresh_jti UK
        bool is_active
    }

    NOTIFICATION {
        uuid id PK
        uuid recipient FK
        string notification_type
        string channel
        bool is_read
    }
```

## Generating a live schema diagram

For a diagram generated straight from the actual migrations (always
in sync with the code, unlike the hand-maintained one above):

```bash
pip install django-extensions pygraphviz
# add "django_extensions" to INSTALLED_APPS locally (dev-only, not committed)
python manage.py graph_models -a -g -o docs/full_schema.png
```

from apps.blood_donation import selectors
from apps.blood_donation.models import BloodRequest
from apps.notifications.models import NotificationType
from apps.notifications.services import notify_users_nearby


def notify_matching_donors(request_obj: BloodRequest, radius_km: float = 25) -> None:
    lat = float(request_obj.latitude) if request_obj.latitude is not None else None
    lng = float(request_obj.longitude) if request_obj.longitude is not None else None
    donors = selectors.get_donors_for_request(request_obj.blood_group, request_obj.city, lat, lng, radius_km)

    notify_users_nearby(
        [d.user for d in donors],
        NotificationType.BLOOD_REQUEST,
        title=f"Urgent: {request_obj.blood_group} blood needed in {request_obj.city}",
        body=request_obj.notes or "Tap to view request details.",
        data={"blood_request_id": str(request_obj.id)},
    )

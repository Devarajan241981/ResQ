from apps.police.gateways import get_gateway
from apps.police.models import CaseForwardRecord, ForwardStatus


def forward_case(police_station, report_type: str, report_id) -> CaseForwardRecord:
    record = CaseForwardRecord.objects.create(
        police_station=police_station, report_type=report_type, report_id=report_id
    )
    reference = get_gateway().forward(record)
    if reference:
        record.status = ForwardStatus.SENT
        record.reference_number = reference
        record.save(update_fields=["status", "reference_number"])
    return record

"""
Pluggable case-forwarding gateway. No government API is hardcoded — a real
integration (state police e-FIR systems, CCTNS, etc.) is dropped in later by
implementing CaseForwardingGateway and pointing settings.POLICE_GATEWAY_BACKEND at it.
"""
from abc import ABC, abstractmethod

from apps.police.models import CaseForwardRecord


class CaseForwardingGateway(ABC):
    @abstractmethod
    def forward(self, record: CaseForwardRecord) -> str:
        """Send the case to the police station's system and return a reference number."""


class NotConfiguredGateway(CaseForwardingGateway):
    """Default gateway: marks the record as pending until a real integration exists."""

    def forward(self, record: CaseForwardRecord) -> str:
        return ""


def get_gateway() -> CaseForwardingGateway:
    return NotConfiguredGateway()

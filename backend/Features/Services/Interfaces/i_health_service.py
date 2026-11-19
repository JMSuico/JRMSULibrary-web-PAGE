# [Layer: Services/Interfaces] — i_health_service.py
"""Contract for health probe orchestration."""

from abc import ABC, abstractmethod
from typing import Dict


class IHealthService(ABC):
    """Service interface returning overall backend readiness status."""

    @abstractmethod
    def get_readiness_status(self) -> Dict[str, str]:
        """Return component health payload for readiness probes."""
        raise NotImplementedError

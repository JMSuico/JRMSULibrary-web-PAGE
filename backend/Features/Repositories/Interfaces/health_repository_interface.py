# [Layer: Repositories/Interfaces] — health_repository_interface.py
"""Contract for database connectivity checks used by health probes."""

from abc import ABC, abstractmethod


class IHealthRepository(ABC):
    """Repository interface for infrastructure liveness and readiness verification."""

    @abstractmethod
    def check_database_connection(self) -> bool:
        """Execute a lightweight query to verify database responsiveness."""
        raise NotImplementedError

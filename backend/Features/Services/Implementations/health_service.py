# [Layer: Services/Implementations] — health_service.py
"""Health probe service coordinating infrastructure readiness checks."""

import logging
from typing import Dict, Optional

from django.db import DatabaseError

from Features.Repositories.Implementations.health_repository import HealthRepository
from Features.Repositories.Interfaces.health_repository_interface import IHealthRepository
from Features.Services.Interfaces.i_health_service import IHealthService

logger = logging.getLogger(__name__)


class HealthService(IHealthService):
    """Verifies database connectivity without exposing internal exception details."""

    def __init__(self, repo: Optional[IHealthRepository] = None):
        self._repo = repo or HealthRepository()

    def get_readiness_status(self) -> Dict[str, str]:
        try:
            db_ok = self._repo.check_database_connection()
        except (DatabaseError, OSError, RuntimeError) as exc:
            logger.error("Healthcheck database connectivity failure: %s", exc)
            db_ok = False

        return {
            "status": "healthy" if db_ok else "unhealthy",
            "database": "ok" if db_ok else "error",
        }

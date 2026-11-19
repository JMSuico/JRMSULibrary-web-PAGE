# [Layer: Repositories/Implementations] — health_repository.py
"""Database connectivity probe implementation."""

from django.db import connections
from Features.Repositories.Interfaces.health_repository_interface import IHealthRepository


class HealthRepository(IHealthRepository):
    """Checks PostgreSQL/default DB availability via a non-mutating SELECT 1 query."""

    def check_database_connection(self) -> bool:
        db_conn = connections["default"]
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            row = cursor.fetchone()
        return bool(row and row[0] == 1)

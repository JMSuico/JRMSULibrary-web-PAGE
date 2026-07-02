# [Layer: Api/Routes] — __init__.py
# Re-exports URL patterns from the main api_router.
# Do NOT add routes directly here — use api_router.py instead.

from .api_router import urlpatterns

__all__ = ['urlpatterns']

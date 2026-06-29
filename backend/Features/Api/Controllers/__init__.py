# [Layer: Api/Controllers] — __init__.py
# Re-exports all controller ViewSets for route registration.
# Do NOT add business logic here — this is an index file only.

from .cms_controller import (
    NewlyAcquiredBookViewSet,
    LibraryInteriorImageViewSet,
    EResourceDepartmentViewSet,
    EResourceFileViewSet,
    PageContentViewSet,
    PageImageViewSet,
    ManagedLinkViewSet,
    ManagedFileViewSet,
)
from .contact_controller import ContactMessageViewSet
from .feedback_controller import FeedbackViewSet
from .personnel_controller import PersonnelViewSet
from .analytics_controller import SiteVisitViewSet

__all__ = [
    'NewlyAcquiredBookViewSet',
    'LibraryInteriorImageViewSet',
    'EResourceDepartmentViewSet',
    'EResourceFileViewSet',
    'PageContentViewSet',
    'PageImageViewSet',
    'ManagedLinkViewSet',
    'ManagedFileViewSet',
    'ContactMessageViewSet',
    'FeedbackViewSet',
    'PersonnelViewSet',
    'SiteVisitViewSet',
]

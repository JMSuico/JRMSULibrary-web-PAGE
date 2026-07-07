# [Layer: Api/Routes] — api_router.py
# All URL patterns — CMS, contact, feedback, personnel, analytics.
# Do NOT put business logic here — routing registration only.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from Features.Api.Controllers import (
    LibraryInteriorImageViewSet,
    EResourceDepartmentViewSet, EResourceFileViewSet,
    PersonnelViewSet, ContactMessageViewSet, FeedbackViewSet,
    PageContentViewSet, PageImageViewSet, ManagedLinkViewSet,
    ManagedFileViewSet, SiteVisitViewSet, AcquisitionBatchViewSet,
    RecycleBinViewSet, NotificationViewSet
)
from Features.Api.Controllers.user_controller import UserViewSet
from Features.Api.Controllers.report_controller import ReportViewSet
from Features.Api.Controllers.settings_controller import SettingsViewSet
from Features.Api.Controllers.external_proxy_controller import (
    vitalsource_auto_login,
    scholaar_auto_login,
)
from Features.Api.Controllers.ai_controller import AIViewSet



router = DefaultRouter()

# CMS endpoints
router.register(r'batches', AcquisitionBatchViewSet, basename='batch')
router.register(r'gallery', LibraryInteriorImageViewSet, basename='gallery')
router.register(r'eresource-departments', EResourceDepartmentViewSet, basename='department')
router.register(r'eresource-files', EResourceFileViewSet, basename='eresource-file')
router.register(r'content', PageContentViewSet, basename='page-content')
router.register(r'page-images', PageImageViewSet, basename='page-image')
router.register(r'links', ManagedLinkViewSet, basename='managed-link')
router.register(r'managed-files', ManagedFileViewSet, basename='managed-file')
router.register(r'users', UserViewSet, basename='user')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'settings', SettingsViewSet, basename='settings')
router.register(r'recycle-bin', RecycleBinViewSet, basename='recycle-bin')
router.register(r'notifications', NotificationViewSet, basename='notification')

# Domain endpoints
router.register(r'personnel', PersonnelViewSet, basename='personnel')
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'ai', AIViewSet, basename='ai')

# Analytics endpoints (admin-only)
router.register(r'site-visits', SiteVisitViewSet, basename='site-visit')

urlpatterns = [
    path('', include(router.urls)),
    # External library proxy (auto-login bridge pages)
    path('external-proxy/vitalsource/', vitalsource_auto_login, name='vitalsource-proxy'),
    path('external-proxy/scholaar/', scholaar_auto_login, name='scholaar-proxy'),
]


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
    ManagedFileViewSet, SiteVisitViewSet, AcquisitionBatchViewSet
)
from Features.Api.Controllers.user_controller import UserViewSet
from Features.Api.Controllers.report_controller import ReportViewSet
from Features.Api.Controllers.settings_controller import SettingsViewSet



router = DefaultRouter()

# CMS endpoints
router.register(r'batches', AcquisitionBatchViewSet, basename='batch')
router.register(r'gallery', LibraryInteriorImageViewSet, basename='gallery')
router.register(r'eresource-departments', EResourceDepartmentViewSet, basename='department')
router.register(r'files', EResourceFileViewSet, basename='file')
router.register(r'content', PageContentViewSet, basename='page-content')
router.register(r'page-images', PageImageViewSet, basename='page-image')
router.register(r'links', ManagedLinkViewSet, basename='managed-link')
router.register(r'managed-files', ManagedFileViewSet, basename='managed-file')
router.register(r'users', UserViewSet, basename='user')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'settings', SettingsViewSet, basename='settings')

# Domain endpoints
router.register(r'personnel', PersonnelViewSet, basename='personnel')
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

# Analytics endpoints (admin-only)
router.register(r'site-visits', SiteVisitViewSet, basename='site-visit')

urlpatterns = [
    path('', include(router.urls)),
]

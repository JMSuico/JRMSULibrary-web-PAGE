# [Layer: Api/Routes] — api_router.py
# All URL patterns — CMS, contact, feedback, personnel, analytics.
# Do NOT put business logic here — routing registration only.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from Features.Api.Controllers import (
    NewlyAcquiredBookViewSet, LibraryInteriorImageViewSet,
    EResourceDepartmentViewSet, EResourceFileViewSet,
    PersonnelViewSet, ContactMessageViewSet, FeedbackViewSet,
    PageContentViewSet, PageImageViewSet, ManagedLinkViewSet,
    ManagedFileViewSet, SiteVisitViewSet
)

router = DefaultRouter()

# CMS endpoints
router.register(r'books', NewlyAcquiredBookViewSet, basename='book')
router.register(r'gallery', LibraryInteriorImageViewSet, basename='gallery')
router.register(r'departments', EResourceDepartmentViewSet, basename='department')
router.register(r'files', EResourceFileViewSet, basename='file')
router.register(r'page-content', PageContentViewSet, basename='page-content')
router.register(r'page-images', PageImageViewSet, basename='page-image')
router.register(r'managed-links', ManagedLinkViewSet, basename='managed-link')
router.register(r'managed-files', ManagedFileViewSet, basename='managed-file')

# Domain endpoints
router.register(r'personnel', PersonnelViewSet, basename='personnel')
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

# Analytics endpoints (admin-only)
router.register(r'site-visits', SiteVisitViewSet, basename='site-visit')

urlpatterns = [
    path('', include(router.urls)),
]

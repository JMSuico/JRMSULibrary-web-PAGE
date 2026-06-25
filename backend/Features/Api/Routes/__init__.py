from django.urls import path, include
from rest_framework.routers import DefaultRouter
from Features.Api.Controllers import (
    NewlyAcquiredBookViewSet, LibraryInteriorImageViewSet,
    EResourceDepartmentViewSet, EResourceFileViewSet,
    PersonnelViewSet, ContactMessageViewSet, FeedbackViewSet
)

router = DefaultRouter()
router.register(r'books', NewlyAcquiredBookViewSet, basename='book')
router.register(r'gallery', LibraryInteriorImageViewSet, basename='gallery')
router.register(r'departments', EResourceDepartmentViewSet, basename='department')
router.register(r'files', EResourceFileViewSet, basename='file')
router.register(r'personnel', PersonnelViewSet, basename='personnel')
router.register(r'contact', ContactMessageViewSet, basename='contact')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
]

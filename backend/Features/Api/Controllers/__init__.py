from rest_framework import viewsets, permissions, filters
from Features.Data.Models import (
    NewlyAcquiredBook, LibraryInteriorImage,
    EResourceDepartment, EResourceFile, Personnel,
    ContactMessage, Feedback
)
from Features.Api.Serializers import (
    NewlyAcquiredBookSerializer, LibraryInteriorImageSerializer,
    EResourceDepartmentSerializer, EResourceFileSerializer,
    PersonnelSerializer, ContactMessageSerializer, FeedbackSerializer
)


class NewlyAcquiredBookViewSet(viewsets.ModelViewSet):
    queryset = NewlyAcquiredBook.objects.filter(is_active=True)
    serializer_class = NewlyAcquiredBookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'genre']
    ordering_fields = ['created_at', 'title']


class LibraryInteriorImageViewSet(viewsets.ModelViewSet):
    queryset = LibraryInteriorImage.objects.filter(is_active=True)
    serializer_class = LibraryInteriorImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'section_label']


class EResourceDepartmentViewSet(viewsets.ModelViewSet):
    queryset = EResourceDepartment.objects.filter(parent__isnull=True)
    serializer_class = EResourceDepartmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class EResourceFileViewSet(viewsets.ModelViewSet):
    queryset = EResourceFile.objects.filter(is_active=True)
    serializer_class = EResourceFileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class PersonnelViewSet(viewsets.ModelViewSet):
    queryset = Personnel.objects.all()
    serializer_class = PersonnelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email']
    ordering_fields = ['created_at']


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'category']
    ordering_fields = ['created_at']

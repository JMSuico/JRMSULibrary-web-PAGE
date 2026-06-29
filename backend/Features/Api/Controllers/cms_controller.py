# [Layer: Api/Controllers] — cms_controller.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from Features.Api.Serializers.cms_serializers import (
    NewlyAcquiredBookSerializer, LibraryInteriorImageSerializer,
    EResourceDepartmentSerializer, EResourceFileSerializer,
    PageContentSerializer, PageImageSerializer,
    ManagedLinkSerializer, ManagedFileSerializer
)

from Features.Repositories.Implementations import (
    NewlyAcquiredBookRepository, LibraryInteriorImageRepository,
    EResourceDepartmentRepository, EResourceFileRepository,
    PageContentRepository, PageImageRepository,
    ManagedLinkRepository, ManagedFileRepository
)
from Features.Services.Implementations import (
    NewlyAcquiredBookService, LibraryInteriorImageService,
    EResourceDepartmentService, EResourceFileService,
    PageContentService, PageImageService,
    ManagedLinkService, ManagedFileService
)

class NewlyAcquiredBookViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = NewlyAcquiredBookService(NewlyAcquiredBookRepository())
    def list(self, request):
        return Response(NewlyAcquiredBookSerializer(self.service.get_all_books(), many=True).data)
    def retrieve(self, request, pk=None):
        item = self.service.get_book_by_id(pk)
        return Response(NewlyAcquiredBookSerializer(item).data) if item else Response(status=404)
    def create(self, request):
        ser = NewlyAcquiredBookSerializer(data=request.data)
        if ser.is_valid():
            return Response(NewlyAcquiredBookSerializer(self.service.add_book(ser.validated_data)).data, status=201)
        return Response(ser.errors, status=400)
    def update(self, request, pk=None):
        ser = NewlyAcquiredBookSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update_book(pk, ser.validated_data)
            return Response(NewlyAcquiredBookSerializer(item).data) if item else Response(status=404)
        return Response(ser.errors, status=400)
    def destroy(self, request, pk=None):
        return Response(status=204) if self.service.delete_book(pk) else Response(status=404)


class LibraryInteriorImageViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = LibraryInteriorImageService(LibraryInteriorImageRepository())
    def list(self, request):
        return Response(LibraryInteriorImageSerializer(self.service.get_gallery_images(), many=True).data)


class EResourceDepartmentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EResourceDepartmentService(EResourceDepartmentRepository())
    def list(self, request):
        return Response(EResourceDepartmentSerializer(self.service.get_departments(), many=True).data)


class EResourceFileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EResourceFileService(EResourceFileRepository())
    def list(self, request):
        return Response(EResourceFileSerializer(self.service.get_all_files(), many=True).data)


class PageContentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = PageContentService(PageContentRepository())
    def list(self, request):
        return Response(PageContentSerializer(self.service.get_all_content(), many=True).data)
    def retrieve(self, request, pk=None): # Note: router mapped this to slug previously, DRF passes it as pk
        item = self.service.get_content_by_slug(pk)
        return Response(PageContentSerializer(item).data) if item else Response(status=404)
    def update(self, request, pk=None):
        ser = PageContentSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update_content(pk, ser.validated_data)
            return Response(PageContentSerializer(item).data) if item else Response(status=404)
        return Response(ser.errors, status=400)


class PageImageViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = PageImageService(PageImageRepository())
    def list(self, request):
        return Response(PageImageSerializer(self.service.get_all_images(), many=True).data)


class ManagedLinkViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ManagedLinkService(ManagedLinkRepository())
    def list(self, request):
        return Response(ManagedLinkSerializer(self.service.get_all_links(), many=True).data)


class ManagedFileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ManagedFileService(ManagedFileRepository())
    def list(self, request):
        return Response(ManagedFileSerializer(self.service.get_all_files(), many=True).data)

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
    """
    Full CRUD for library interior images.
    - GET /api/gallery/ → public list (active only)
    - All other actions require authentication.
    """
    # Removed incorrect parser_classes

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = LibraryInteriorImageService(LibraryInteriorImageRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_gallery_images()
        else:
            data = self.service.get_all()
        return Response(LibraryInteriorImageSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        ser = LibraryInteriorImageSerializer(data=request.data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(LibraryInteriorImageSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def partial_update(self, request, pk=None, *args, **kwargs):
        ser = LibraryInteriorImageSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            if item:
                return Response(LibraryInteriorImageSerializer(item).data)
            return Response(status=404)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        if self.service.delete(pk):
            return Response(status=204)
        return Response(status=404)


class EResourceDepartmentViewSet(viewsets.ViewSet):
    # Removed incorrect parser_classes
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EResourceDepartmentService(EResourceDepartmentRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_departments()
        else:
            data = self.service.get_all()
        return Response(EResourceDepartmentSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        ser = EResourceDepartmentSerializer(data=request.data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(EResourceDepartmentSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def partial_update(self, request, pk=None, *args, **kwargs):
        ser = EResourceDepartmentSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            if item:
                return Response(EResourceDepartmentSerializer(item).data)
            return Response(status=404)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        if self.service.delete(pk):
            return Response(status=204)
        return Response(status=404)


class EResourceFileViewSet(viewsets.ViewSet):
    # Removed incorrect parser_classes
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EResourceFileService(EResourceFileRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_all_files()
        else:
            data = self.service.get_all()
        return Response(EResourceFileSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        # Merge request.data (text fields) with request.FILES (uploaded file)
        mutable_data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
        if 'file' in request.FILES:
            mutable_data['file'] = request.FILES['file']
        ser = EResourceFileSerializer(data=mutable_data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(EResourceFileSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def partial_update(self, request, pk=None, *args, **kwargs):
        ser = EResourceFileSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            if item:
                return Response(EResourceFileSerializer(item).data)
            return Response(status=404)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        if self.service.delete(pk):
            return Response(status=204)
        return Response(status=404)


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
    # Removed incorrect parser_classes
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ManagedLinkService(ManagedLinkRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_all_links()
        else:
            data = self.service.get_all()
        return Response(ManagedLinkSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        ser = ManagedLinkSerializer(data=request.data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(ManagedLinkSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def partial_update(self, request, pk=None, *args, **kwargs):
        ser = ManagedLinkSerializer(data=request.data, partial=True)
        if ser.is_valid():
            item = self.service.update(pk, ser.validated_data)
            if item:
                return Response(ManagedLinkSerializer(item).data)
            return Response(status=404)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        if self.service.delete(pk):
            return Response(status=204)
        return Response(status=404)


class ManagedFileViewSet(viewsets.ViewSet):
    # Removed incorrect parser_classes
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ManagedFileService(ManagedFileRepository())

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def list(self, request):
        if not request.user.is_authenticated:
            data = self.service.get_all_files()
        else:
            data = self.service.get_all()
        return Response(ManagedFileSerializer(data, many=True).data)

    def create(self, request, *args, **kwargs):
        # Merge request.data (text fields) with request.FILES (uploaded file)
        mutable_data = request.data.dict() if hasattr(request.data, 'dict') else dict(request.data)
        if 'file' in request.FILES:
            mutable_data['file'] = request.FILES['file']
        ser = ManagedFileSerializer(data=mutable_data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(ManagedFileSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        if self.service.delete(pk):
            return Response(status=204)
        return Response(status=404)

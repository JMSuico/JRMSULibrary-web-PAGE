# [Layer: Api/Controllers] — cms_controller.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from Features.Data.Models.recycle_bin_model import RecycleBin

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
from Features.Helpers.malware_scanner_helper import MalwareScannerHelper

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
        item = self.service.get_by_id(pk)
        if item:
            RecycleBin.objects.create(
                original_id=item.id,
                source_module='GALLERY',
                item_name=item.title or f"Gallery Image {item.id}",
                data_snapshot=LibraryInteriorImageSerializer(item).data,
                deleted_by=request.user.id if request.user.is_authenticated else None
            )
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
        # Always return root-level departments; the serializer recursively nests children
        data = self.service.get_departments()
        return Response(EResourceDepartmentSerializer(data, many=True, context={'request': request}).data)

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
        item = self.service.get_by_id(pk)
        if item:
            RecycleBin.objects.create(
                original_id=item.id,
                source_module='ERESOURCE_DEPT',
                item_name=item.name or f"Department {item.id}",
                data_snapshot=EResourceDepartmentSerializer(item).data,
                deleted_by=request.user.id if request.user.is_authenticated else None
            )
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
            uploaded_file = request.FILES['file']
            ext = uploaded_file.name.split('.')[-1].lower()
            allowed_extensions = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'csv', 'xlsx'}
            if ext not in allowed_extensions:
                return Response({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}, status=400)
            
            from rest_framework.exceptions import ValidationError
            try:
                MalwareScannerHelper.verify_file_safety(uploaded_file)
            except ValidationError as e:
                return Response({'error': str(e)}, status=400)
                
            mutable_data['file'] = uploaded_file
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
        item = self.service.get_by_id(pk)
        if item:
            RecycleBin.objects.create(
                original_id=item.id,
                source_module='ERESOURCE_FILE',
                item_name=item.title or f"E-Resource File {item.id}",
                data_snapshot=EResourceFileSerializer(item).data,
                deleted_by=request.user.id if request.user.is_authenticated else None
            )
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
    def partial_update(self, request, pk=None):
        return self.update(request, pk)


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
        item = self.service.get_by_id(pk)
        if item:
            RecycleBin.objects.create(
                original_id=item.id,
                source_module='CMS_LINK',
                item_name=item.name or f"Link {item.id}",
                data_snapshot=ManagedLinkSerializer(item).data,
                deleted_by=request.user.id if request.user.is_authenticated else None
            )
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
            uploaded_file = request.FILES['file']
            ext = uploaded_file.name.split('.')[-1].lower()
            allowed_extensions = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'csv', 'xlsx', 'pptx', 'zip'}
            if ext not in allowed_extensions:
                return Response({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}, status=400)
                
            from rest_framework.exceptions import ValidationError
            try:
                MalwareScannerHelper.verify_file_safety(uploaded_file)
            except ValidationError as e:
                return Response({'error': str(e)}, status=400)
                
            mutable_data['file'] = uploaded_file
        ser = ManagedFileSerializer(data=mutable_data)
        if ser.is_valid():
            item = self.service.create(ser.validated_data)
            return Response(ManagedFileSerializer(item).data, status=201)
        return Response(ser.errors, status=400)

    def destroy(self, request, pk=None):
        item = self.service.get_by_id(pk)
        if item:
            RecycleBin.objects.create(
                original_id=item.id,
                source_module='CMS_FILE',
                item_name=item.name or f"File {item.id}",
                data_snapshot=ManagedFileSerializer(item).data,
                deleted_by=request.user.id if request.user.is_authenticated else None
            )
        if self.service.delete(pk):
            return Response(status=204)
        return Response(status=404)

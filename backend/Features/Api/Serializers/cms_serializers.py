# [Layer: Api/Serializers] — cms_serializers.py
# Data shaping for CMS entities: Books, Gallery, Departments, EResources,
# PageContent, PageImages, ManagedLinks, ManagedFiles, SiteVisits.
# Do NOT put business validation here.

from rest_framework import serializers
from Features.Data.Models import (
    NewlyAcquiredBook, LibraryInteriorImage,
    EResourceDepartment, EResourceFile,
    PageContent, PageImage, ManagedLink, ManagedFile, SiteVisit
)


class NewlyAcquiredBookSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewlyAcquiredBook
        fields = '__all__'


class LibraryInteriorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LibraryInteriorImage
        fields = '__all__'


class EResourceDepartmentSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    class Meta:
        model = EResourceDepartment
        fields = ['id', 'name', 'parent', 'order', 'children', 'files']

    def get_children(self, obj):
        cache = getattr(obj, '_prefetched_objects_cache', None)
        children = cache['children'] if cache is not None and 'children' in cache else obj.children.all().order_by('order', 'id')
        return EResourceDepartmentSerializer(children, many=True, context=self.context).data

    def get_files(self, obj):
        # Admin (authenticated) sees all files; public sees only active ones
        request = self.context.get('request')
        is_auth = bool(request and getattr(request, 'user', None) and request.user.is_authenticated)
        cache = getattr(obj, '_prefetched_objects_cache', None)
        if cache is not None and 'files' in cache:
            files = cache['files'] if is_auth else [f for f in cache['files'] if f.is_active]
        else:
            qs = obj.files.defer('extracted_text', 'summary', 'table_of_contents', 'keywords')
            files = (qs.all() if is_auth else qs.filter(is_active=True)).order_by('name')
        return EResourceFileSerializer(files, many=True, context=self.context).data


class EResourceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EResourceFile
        fields = ['id', 'name', 'file', 'department', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = '__all__'


class PageImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageImage
        fields = '__all__'


class ManagedLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagedLink
        fields = '__all__'


class ManagedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagedFile
        fields = '__all__'


class SiteVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisit
        fields = '__all__'

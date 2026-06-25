from rest_framework import serializers
from Features.Data.Models import (
    NewlyAcquiredBook, LibraryInteriorImage,
    EResourceDepartment, EResourceFile, Personnel,
    ContactMessage, Feedback
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
        return EResourceDepartmentSerializer(obj.children.all(), many=True).data

    def get_files(self, obj):
        files = obj.files.filter(is_active=True)
        return EResourceFileSerializer(files, many=True).data


class EResourceFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EResourceFile
        fields = ['id', 'name', 'file', 'is_active']


class PersonnelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personnel
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'message', 'created_at', 'is_read']
        read_only_fields = ['created_at', 'is_read']


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
        read_only_fields = ['created_at']

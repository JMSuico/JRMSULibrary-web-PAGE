# [Layer: Api/Serializers] — batch_serializer.py
# Data shaping for Batch API

from rest_framework import serializers
from Features.Data.Models import AcquisitionBatch, BatchHistory, NewlyAcquiredBook
from Features.Data.Enums.batch_status import BatchStatus

class BatchBookSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = NewlyAcquiredBook
        fields = ['id', 'title', 'author', 'accession_number', 'category', 'cover_image', 'date_encoded']

    def get_cover_image(self, obj):
        if obj.cover_image:
            # Always return relative URL so frontend proxy handles it, fixing cross-device broken images
            return obj.cover_image.url
        return None

class AcquisitionBatchSerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model = AcquisitionBatch
        fields = ['id', 'name', 'description', 'status', 'is_display_batch', 'opened_at', 'closed_at', 'safety_expiry', 'created_by', 'remarks', 'book_count']
        read_only_fields = ['id', 'status', 'is_display_batch', 'opened_at', 'closed_at', 'created_by']

    def get_book_count(self, obj):
        return obj.books.count()

class AcquisitionBatchDetailSerializer(AcquisitionBatchSerializer):
    books = serializers.SerializerMethodField()

    class Meta(AcquisitionBatchSerializer.Meta):
        fields = AcquisitionBatchSerializer.Meta.fields + ['books']

    def get_books(self, obj):
        serializer = BatchBookSerializer(obj.books.all(), many=True, context=self.context)
        return serializer.data

class BatchHistorySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = BatchHistory
        fields = ['id', 'action', 'details', 'performed_by', 'performed_by_name', 'timestamp']

    def get_performed_by_name(self, obj):
        return obj.performed_by.username if obj.performed_by else 'System'

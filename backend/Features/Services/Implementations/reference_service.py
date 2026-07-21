from Features.Repositories.Implementations.reference_repository import ResearchReferenceRepository
from Features.Api.Serializers.reference_serializer import ResearchReferenceSerializer


class ResearchReferenceService:
    def __init__(self):
        self.repo = ResearchReferenceRepository()

    def get_all_references(self, request=None, query=None, category=None, department=None):
        qs = self.repo.search(query=query, category=category, department=department)
        return ResearchReferenceSerializer(qs, many=True, context={'request': request}).data

    def get_reference_by_id(self, reference_id, request=None):
        ref = self.repo.get_by_id(reference_id)
        if ref:
            return ResearchReferenceSerializer(ref, context={'request': request}).data
        return None

    def create_reference(self, data, request=None):
        serializer = ResearchReferenceSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            ref = self.repo.create(serializer.validated_data)
            return True, ResearchReferenceSerializer(ref, context={'request': request}).data
        return False, serializer.errors

    def update_reference(self, reference_id, data, request=None):
        ref = self.repo.get_by_id(reference_id)
        if not ref:
            return False, "Reference not found"

        # Handle file replacement/cleanup
        if 'access_file' in data:
            if ref.access_file and (data['access_file'] is None or data['access_file'] != ref.access_file):
                ref.access_file.delete(save=False)

        serializer = ResearchReferenceSerializer(ref, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_ref = self.repo.update(ref, serializer.validated_data)
            return True, ResearchReferenceSerializer(updated_ref, context={'request': request}).data
        return False, serializer.errors

    def delete_reference(self, reference_id, request=None):
        ref = self.repo.get_by_id(reference_id)
        if not ref:
            return False, "Reference not found"
        
        # Serialize for recycle bin
        snapshot = ResearchReferenceSerializer(ref, context={'request': request}).data
        from Features.Data.Models.recycle_bin_model import RecycleBin
        RecycleBin.objects.create(
            original_id=ref.id,
            source_module='RESEARCH_REF',
            item_name=ref.title,
            data_snapshot=snapshot,
            deleted_by=request.user.id if request and request.user.is_authenticated else None
        )
        
        self.repo.delete(ref)
        return True, "Reference deleted and moved to recycle bin"

    def bulk_import_references(self, records_list):
        """
        Validates each record via the serializer before handing off to the repository.
        Returns (created_count, errors_list).
        """
        valid_records = []
        errors = []

        for idx, record in enumerate(records_list):
            serializer = ResearchReferenceSerializer(data=record)
            if serializer.is_valid():
                valid_records.append(serializer.validated_data)
            else:
                errors.append({
                    'row': idx + 1,
                    'title': record.get('title', ''),
                    'error': serializer.errors,
                })

        created, db_errors = self.repo.bulk_create(valid_records)
        errors.extend(db_errors)
        return created, errors

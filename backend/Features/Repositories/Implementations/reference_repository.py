from django.db.models import Q
from Features.Data.Models.research_reference_model import ResearchReference


class ResearchReferenceRepository:
    def get_all(self):
        return ResearchReference.objects.all().order_by('-created_at')

    def get_by_id(self, reference_id):
        try:
            return ResearchReference.objects.get(id=reference_id)
        except ResearchReference.DoesNotExist:
            return None

    def search(self, query=None, category=None, department=None):
        qs = self.get_all()
        if category and category != 'All':
            qs = qs.filter(category=category)

        if department and department != 'All':
            qs = qs.filter(department=department)

        if query:
            qs = qs.filter(
                Q(title__icontains=query) |
                Q(author__icontains=query) |
                Q(call_number__icontains=query) |
                Q(acc_no__icontains=query)
            )
        return qs

    def create(self, data):
        return ResearchReference.objects.create(**data)

    def bulk_create(self, records_list):
        """
        Bulk insert a list of dicts. Returns (created_count, errors).
        Uses individual saves so that validation errors are captured per-row.
        """
        created = 0
        errors = []
        for idx, record in enumerate(records_list):
            try:
                ResearchReference.objects.create(**record)
                created += 1
            except Exception as e:
                errors.append({'row': idx + 1, 'error': str(e), 'title': record.get('title', '')})
        return created, errors

    def get_by_scopes(self, scopes):
        """
        Fetches all DB records that belong to any of the (category, department) scope tuples.
        Used by Smart Sync to determine the 'current universe' for diffing.
        scopes = list of (category_str, department_str_or_None)
        """
        if not scopes:
            return ResearchReference.objects.none()
        q = Q()
        for category, dept in scopes:
            if dept:
                q |= Q(category=category, department=dept)
            else:
                q |= Q(category=category, department__isnull=True)
        return ResearchReference.objects.filter(q)

    def bulk_update_fields(self, updates):
        """
        Applies field-level patches per record.
        updates = list of dicts, each must contain 'id' plus the fields to update.
        Returns (updated_count, errors).
        """
        updated = 0
        errors = []
        for item in updates:
            ref_id = item.get('id')
            fields = {k: v for k, v in item.items() if k != 'id'}
            try:
                ref = self.get_by_id(ref_id)
                if ref:
                    for field, value in fields.items():
                        setattr(ref, field, value)
                    ref.save()
                    updated += 1
                else:
                    errors.append({'id': ref_id, 'error': 'Record not found'})
            except Exception as e:
                errors.append({'id': ref_id, 'error': str(e)})
        return updated, errors

    def update(self, reference, data):
        for field, value in data.items():
            setattr(reference, field, value)
        reference.save()
        return reference

    def delete(self, reference):
        reference.delete()

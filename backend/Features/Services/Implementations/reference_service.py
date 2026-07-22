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

    def delete_reference(self, pk, request=None):
        ref = self.repo.get_by_id(pk)
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

    def bulk_delete_references(self, ids, user_id=None):
        """
        Deletes multiple references and moves them to the recycle bin atomically.
        """
        from django.db import transaction
        from Features.Data.Models.recycle_bin_model import RecycleBin
        
        deleted_count = 0
        with transaction.atomic():
            for pk in ids:
                ref = self.repo.get_by_id(pk)
                if ref:
                    # Not passing request avoids absolute URL generation which is better for recycle bin backups
                    snapshot = ResearchReferenceSerializer(ref).data
                    RecycleBin.objects.create(
                        original_id=ref.id,
                        source_module='RESEARCH_REF',
                        item_name=ref.title,
                        data_snapshot=snapshot,
                        deleted_by=user_id
                    )
                    self.repo.delete(ref)
                    deleted_count += 1
        
        return True, f"{deleted_count} references deleted"

    def _fingerprint(self, record):
        return (
            (record.get('title') or '').strip().lower(),
            (record.get('author') or '').strip().lower(),
            (record.get('category') or '').strip().lower(),
            (record.get('department') or '').strip().lower(),
        )

    def compute_sync_diff(self, incoming_records):
        """
        Compares incoming_records against DB.
        Returns { to_create, to_update, to_delete, unchanged_count }.
        """
        # Determine scopes from incoming records
        scopes = set()
        for rec in incoming_records:
            category = (rec.get('category') or '').strip()
            dept = (rec.get('department') or '').strip()
            dept = dept if dept else None
            if category:
                scopes.add((category, dept))
        
        # Fetch current universe from DB
        db_records = self.repo.get_by_scopes(scopes)
        db_map = {}
        for db_rec in db_records:
            fp = self._fingerprint({
                'title': db_rec.title,
                'author': db_rec.author,
                'category': db_rec.category,
                'department': db_rec.department
            })
            db_map[fp] = db_rec
        
        to_create = []
        to_update = []
        unchanged = 0
        incoming_fps = set()

        # Compare incoming vs DB
        for rec in incoming_records:
            fp = self._fingerprint(rec)
            incoming_fps.add(fp)

            if fp in db_map:
                db_rec = db_map[fp]
                changes = {}
                # Check for changes in specific fields
                fields_to_check = ['acc_no', 'call_number', 'copyright', 'remarks', 'inventory_year', 'no']
                for f in fields_to_check:
                    # Treat empty strings and None as equivalent for comparison if applicable, but since serializer cleans it up, we compare direct values
                    new_val = rec.get(f)
                    old_val = getattr(db_rec, f)
                    
                    # Normalise Nones and empty strings for loose equality
                    n_new = str(new_val).strip() if new_val is not None else ""
                    n_old = str(old_val).strip() if old_val is not None else ""
                    
                    if n_new != n_old:
                        changes[f] = [old_val, new_val]

                if changes:
                    rec_with_id = {**rec, 'id': db_rec.id, 'changes': changes}
                    to_update.append(rec_with_id)
                else:
                    unchanged += 1
            else:
                to_create.append(rec)

        # Find deleted (in DB but not in incoming_fps)
        to_delete = []
        for fp, db_rec in db_map.items():
            if fp not in incoming_fps:
                to_delete.append({
                    'id': db_rec.id,
                    'title': db_rec.title,
                    'author': db_rec.author,
                    'department': db_rec.department
                })

        return {
            'to_create': to_create,
            'to_update': to_update,
            'to_delete': to_delete,
            'unchanged': unchanged
        }

    def commit_sync(self, to_create, to_update, to_delete_ids, apply_deletions, user_id=None):
        """
        Atomically applies the diff.
        """
        from django.db import transaction
        created_count = 0
        updated_count = 0
        deleted_count = 0
        errors = []

        with transaction.atomic():
            # 1. Create
            if to_create:
                c, errs = self.repo.bulk_create(to_create)
                created_count += c
                errors.extend(errs)

            # 2. Update
            if to_update:
                update_payloads = []
                for rec in to_update:
                    # Extract only the fields to update, plus ID
                    update_payload = {'id': rec['id']}
                    for f in rec.get('changes', {}).keys():
                        update_payload[f] = rec.get(f)
                    update_payloads.append(update_payload)
                
                u, u_errs = self.repo.bulk_update_fields(update_payloads)
                updated_count += u
                errors.extend(u_errs)

            # 3. Delete
            if apply_deletions and to_delete_ids:
                for d_id in to_delete_ids:
                    ref = self.repo.get_by_id(d_id)
                    if ref:
                        # Serialize for recycle bin
                        snapshot = ResearchReferenceSerializer(ref, context=None).data
                        from Features.Data.Models.recycle_bin_model import RecycleBin
                        RecycleBin.objects.create(
                            original_id=ref.id,
                            source_module='RESEARCH_REF',
                            item_name=ref.title,
                            data_snapshot=snapshot,
                            deleted_by=user_id
                        )
                        self.repo.delete(ref)
                        deleted_count += 1
                    else:
                        errors.append({'id': d_id, 'error': 'Failed to delete, not found.'})

        return {
            'created': created_count,
            'updated': updated_count,
            'deleted': deleted_count,
            'errors': errors
        }

from celery import shared_task
from Features.Services.Implementations.reference_service import ResearchReferenceService
from Features.Services.Implementations.contact_service import ContactService
from Features.Services.Implementations.report_service import ReportService
from django.contrib.auth import get_user_model

@shared_task
def process_sync_chunk_task(to_create, to_update, to_delete_ids, apply_deletions, user_id=None):
    service = ResearchReferenceService()
    # Execute the sync commit logic asynchronously
    service.commit_sync(to_create, to_update, to_delete_ids, apply_deletions, user_id=user_id)
    return "Sync chunk processed successfully"

@shared_task
def process_bulk_reply_task(message_ids, reply_body):
    service = ContactService()
    results = []
    for msg_id in message_ids:
        try:
            res = service.reply_to_message(int(msg_id), reply_body)
            results.append({'id': msg_id, 'success': res.get('success', False)})
        except Exception as e:
            results.append({'id': msg_id, 'success': False, 'error': str(e)})
    return results

@shared_task
def process_single_reply_task(message_id, reply_body, send_to_chatbot=False):
    service = ContactService()
    try:
        service.reply_to_message(message_id, reply_body, send_to_chatbot)
        return True
    except Exception as e:
        return str(e)

@shared_task
def generate_report_task(title, report_type, date_range, user_id, report_data):
    service = ReportService()
    User = get_user_model()
    user = User.objects.filter(id=user_id).first() if user_id else None
    
    report = service.generate_and_save_report(
        title=title,
        report_type=report_type,
        date_range=date_range,
        generated_by=user,
        report_data=report_data
    )
    return f"Report {report.id} generated"

@shared_task
def process_bulk_import_task(records):
    service = ResearchReferenceService()
    created, errors = service.bulk_import_references(records)
    return {'created': created, 'errors': errors}

@shared_task
def process_bulk_delete_task(ids, user_id=None):
    service = ResearchReferenceService()
    success, result = service.bulk_delete_references(ids, user_id=user_id)
    return result
# [Layer: Services/Implementations] â¬   tasks_bulk.py
from celery import shared_task
from django.db import transaction

def get_service_for_type(entity_type):
    if entity_type == 'USER':
        from Features.Services.Implementations.user_service import UserService
        from Features.Repositories.Implementations.user_repository import UserRepository
        return UserService(UserRepository())
    elif entity_type == 'PERSONNEL':
        from Features.Services.Implementations.personnel_service import PersonnelService
        from Features.Repositories.Implementations.personnel_repository import PersonnelRepository
        return PersonnelService(PersonnelRepository())
    elif entity_type == 'ERESOURCE_DEPT':
        from Features.Services.Implementations.eresource_service import EResourceDepartmentService
        from Features.Repositories.Implementations.eresource_repository import EResourceDepartmentRepository
        return EResourceDepartmentService(EResourceDepartmentRepository())
    elif entity_type == 'ERESOURCE_FILE':
        from Features.Services.Implementations.eresource_service import EResourceFileService
        from Features.Repositories.Implementations.eresource_repository import EResourceFileRepository
        return EResourceFileService(EResourceFileRepository())
    elif entity_type == 'GALLERY':
        from Features.Services.Implementations.gallery_service import LibraryInteriorImageService
        from Features.Repositories.Implementations.gallery_repository import LibraryInteriorImageRepository
        return LibraryInteriorImageService(LibraryInteriorImageRepository())
    elif entity_type == 'CMS_LINK':
        from Features.Services.Implementations.cms_service import ManagedLinkService
        from Features.Repositories.Implementations.cms_repository import ManagedLinkRepository
        return ManagedLinkService(ManagedLinkRepository())
    elif entity_type == 'CMS_FILE':
        from Features.Services.Implementations.cms_service import ManagedFileService
        from Features.Repositories.Implementations.cms_repository import ManagedFileRepository
        return ManagedFileService(ManagedFileRepository())
    elif entity_type == 'CONTACT':
        from Features.Services.Implementations.contact_service import ContactService
        return ContactService()
    elif entity_type == 'BATCH':
        from Features.Services.Implementations.batch_service import BatchService
        return BatchService()
    elif entity_type == 'REPORT':
        from Features.Services.Implementations.report_service import ReportService
        return ReportService()
    elif entity_type == 'RESEARCH_REF':
        from Features.Services.Implementations.reference_service import ResearchReferenceService
        return ResearchReferenceService()
    elif entity_type == 'BOOK':
        from Features.Services.Implementations.book_service import NewlyAcquiredBookService
        from Features.Repositories.Implementations.book_repository import NewlyAcquiredBookRepository
        return NewlyAcquiredBookService(NewlyAcquiredBookRepository())
    return None

@shared_task
def generic_bulk_delete_task(entity_type, ids, user_id=None):
    service = get_service_for_type(entity_type)
    if not service:
        return f"Unknown entity type {entity_type}"
    
    deleted_count = 0
    errors = []
    
    with transaction.atomic():
        for item_id in ids:
            try:
                # Most services implement delete(id, user_id=None) or delete(id)
                # We try passing user_id, if it fails due to signature we just pass id
                import inspect
                sig = inspect.signature(service.delete)
                if 'user_id' in sig.parameters:
                    res = service.delete(item_id, user_id=user_id)
                else:
                    res = service.delete(item_id)
                    
                if res:
                    deleted_count += 1
            except Exception as e:
                errors.append(f"Failed to delete {item_id}: {str(e)}")
                
    return f"Successfully deleted {deleted_count} {entity_type}s. Errors: {len(errors)}"

@shared_task
def generic_bulk_restore_task(ids, user_id=None):
    from Features.Services.Implementations.recycle_bin_service import RecycleBinService
    service = RecycleBinService()
    
    restored_count = 0
    with transaction.atomic():
        for item_id in ids:
            try:
                res = service.restore_item(item_id)
                if res:
                    restored_count += 1
            except Exception as e:
                pass
    return f"Restored {restored_count} items"

@shared_task
def generic_bulk_hard_delete_task(ids, user_id=None):
    from Features.Services.Implementations.recycle_bin_service import RecycleBinService
    service = RecycleBinService()
    
    deleted_count = 0
    with transaction.atomic():
        for item_id in ids:
            try:
                res = service.delete_permanently(item_id)
                if res:
                    deleted_count += 1
            except Exception as e:
                pass
    return f"Hard deleted {deleted_count} items"

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

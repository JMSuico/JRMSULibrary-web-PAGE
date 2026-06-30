from django.contrib import admin
from Features.Data.Models import (
    Account, ContactMessage, Feedback, Personnel,
    NewlyAcquiredBook, LibraryInteriorImage,
    EResourceDepartment, EResourceFile,
    AcquisitionBatch, BatchHistory
)

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_librarian', 'is_guest', 'is_staff']
    list_filter = ['is_librarian', 'is_guest', 'is_staff']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'created_at', 'is_read']
    list_filter = ['is_read']
    search_fields = ['name', 'email', 'message']


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'category', 'rating', 'created_at']
    list_filter = ['category', 'rating']
    search_fields = ['name', 'email', 'message']


@admin.register(Personnel)
class PersonnelAdmin(admin.ModelAdmin):
    list_display = ['name', 'title', 'order']
    list_editable = ['order']

@admin.register(AcquisitionBatch)
class AcquisitionBatchAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'is_display_batch', 'opened_at', 'closed_at', 'created_by']
    list_filter = ['status', 'is_display_batch']
    search_fields = ['name']

@admin.register(BatchHistory)
class BatchHistoryAdmin(admin.ModelAdmin):
    list_display = ['batch', 'action', 'performed_by', 'timestamp']
    list_filter = ['action']
    search_fields = ['batch__name', 'action']

@admin.register(NewlyAcquiredBook)
class NewlyAcquiredBookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'batch', 'date_encoded']
    list_filter = ['category', 'batch']
    search_fields = ['title', 'author', 'accession_number']


@admin.register(LibraryInteriorImage)
class LibraryInteriorImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'section_label', 'is_active']
    list_filter = ['is_active']


@admin.register(EResourceDepartment)
class EResourceDepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'order']
    list_filter = ['parent']


@admin.register(EResourceFile)
class EResourceFileAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'is_active']
    list_filter = ['department', 'is_active']
    search_fields = ['name']

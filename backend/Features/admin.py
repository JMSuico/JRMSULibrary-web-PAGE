from django.contrib import admin
from Features.Data.Models import (
    Account, ContactMessage, Feedback, Personnel,
    NewlyAcquiredBook, LibraryInteriorImage,
    EResourceDepartment, EResourceFile
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


@admin.register(NewlyAcquiredBook)
class NewlyAcquiredBookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'genre', 'is_active', 'created_at']
    list_filter = ['genre', 'is_active']
    search_fields = ['title', 'author']


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

from django.db import models
from django.utils import timezone
from Features.Data.Enums.research_department_enum import ResearchDepartment

class ResearchReference(models.Model):
    CATEGORY_CHOICES = [
        ('Research for College Student in JRMSU', 'Research for College Student in JRMSU'),
        ('Thesis and Dissertation', 'Thesis and Dissertation'),
    ]

    ACCESS_CHOICES = [
        ('none', 'None'),
        ('link', 'Online Link'),
        ('file', 'Uploaded File'),
    ]

    category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
    department = models.CharField(
        max_length=255,
        choices=ResearchDepartment.choices,
        null=True,
        blank=True,
        help_text='Only applicable for student research records.'
    )
    no = models.IntegerField(null=True, blank=True)
    acc_no = models.CharField(max_length=255, null=True, blank=True)
    call_number = models.CharField(max_length=255, null=True, blank=True)
    title = models.CharField(max_length=500)
    author = models.CharField(max_length=500, null=True, blank=True)
    copyright = models.CharField(max_length=255, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    resource_status = models.CharField(max_length=255, null=True, blank=True)
    inventory_year = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text='Value from the Inventory column in the Excel import (e.g. "2026").'
    )

    access_type = models.CharField(max_length=10, choices=ACCESS_CHOICES, default='none')
    access_link = models.URLField(max_length=1000, null=True, blank=True)
    access_file = models.FileField(upload_to='research_references/', null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'research_references'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.category})"

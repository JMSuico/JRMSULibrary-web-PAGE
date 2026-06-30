# [Layer: Data/Models] — site_settings_model.py
# Represents the global configuration for the Library. Only one instance should ideally exist.

from django.db import models

class SiteSettings(models.Model):
    id = models.AutoField(primary_key=True)
    library_name = models.CharField(max_length=255, default="JRMSU Katipunan Library")
    address = models.CharField(max_length=500, default="Katipunan, Zamboanga del Norte")
    contact_email = models.EmailField(default="katipunan.library@jrmsu.edu.ph")
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Opening Hours
    opening_hours_mon_fri = models.CharField(max_length=100, default="7:00 AM - 7:00 PM")
    opening_hours_sat = models.CharField(max_length=100, default="Closed")
    opening_hours_sun = models.CharField(max_length=100, default="Closed")

    # The singleton pattern is enforced at the repository/service layer
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'site_settings'
        app_label = 'Features'

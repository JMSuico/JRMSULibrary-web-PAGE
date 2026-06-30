from django.db import models

class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ('UNREAD', 'Unread'),
        ('READ', 'Read'),
        ('REPLIED', 'Replied'),
    ]
    
    TYPE_CHOICES = [
        ('EMAIL', 'Email Message'),
        ('RESERVATION', 'Reservation Request'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    message_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='EMAIL')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UNREAD')
    
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False) # Keep for backwards compatibility, but use status going forward

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_message_type_display()}: {self.name} - {self.subject or 'No Subject'}"


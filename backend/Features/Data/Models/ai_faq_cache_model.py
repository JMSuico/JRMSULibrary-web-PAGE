from django.db import models
from django.utils import timezone

class AIFaqCache(models.Model):
    """
    Stores semantic questions and multiple alternative answers for the AI Chatbot.
    Offloads AI state tracking to the database instead of JSON files.
    """
    question = models.CharField(max_length=500, unique=True, db_index=True)
    answers = models.JSONField(default=list)
    created_at = models.DateTimeField(default=timezone.now)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_faq_cache'
        verbose_name = 'AI FAQ Cache'
        verbose_name_plural = 'AI FAQ Caches'
        ordering = ['-last_accessed']

    def __str__(self):
        return self.question

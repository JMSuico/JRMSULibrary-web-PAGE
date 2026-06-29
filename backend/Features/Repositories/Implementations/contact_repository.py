# [Layer: Repositories/Implementations] — contact_repository.py
# Contact inquiry persistence via Django ORM.
# Do NOT put business rules here — only data access operations.

from Features.Data.Models import ContactMessage
from Features.Repositories.Interfaces.contact_repository_interface import ContactRepositoryInterface


class ContactRepository(ContactRepositoryInterface):

    def create(self, data: dict):
        return ContactMessage.objects.create(**data)

    def get_all(self):
        return ContactMessage.objects.all().order_by('-created_at')

    def get_by_id(self, message_id: int):
        return ContactMessage.objects.get(pk=message_id)

    def mark_as_read(self, message_id: int):
        message = self.get_by_id(message_id)
        message.is_read = True
        message.save()
        return message

# [Layer: Api/Controllers] — report_controller.py

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from Features.Services.Implementations.analytics_service import SiteVisitService
from Features.Services.Implementations.batch_service import BatchService
from Features.Services.Implementations.contact_service import ContactService
from Features.Services.Implementations.feedback_service import FeedbackService
from Features.Repositories.Implementations.analytics_repository import SiteVisitRepository
from Features.Repositories.Implementations.book_repository import NewlyAcquiredBookRepository
from Features.Repositories.Implementations.contact_repository import ContactRepository

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.visit_service = SiteVisitService(SiteVisitRepository())
        self.book_service = BatchService()
        self.contact_service = ContactService()
        self.feedback_service = FeedbackService()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        import datetime
        from django.utils import timezone
        
        all_visits = self.visit_service.get_all_visits()
        all_books = self.book_service.get_all_books()
        all_messages = self.contact_service.get_all_messages()
        
        total_visits = len(all_visits)
        total_books = len(all_books)
        total_emails = len([m for m in all_messages if m.message_type == 'EMAIL'])
        total_reservations = len([m for m in all_messages if m.message_type == 'RESERVATION'])

        recent_emails = sorted([m for m in all_messages if m.message_type == 'EMAIL'], key=lambda x: x.created_at, reverse=True)[:5]
        
        # Simple grouping for charts (last 7 days of visits)
        today = timezone.now().date()
        visitors_data = []
        for i in range(6, -1, -1):
            d = today - datetime.timedelta(days=i)
            day_name = d.strftime('%a')
            count = len([v for v in all_visits if v.visited_at.date() == d])
            visitors_data.append({"name": day_name, "visitors": count})
            
        # Basic book trend (mocking monthly for now based on recent books, as it's hard to group by month dynamically without more data)
        # We will just return the most recent 5 books instead for the table.
        recent_books = sorted(all_books, key=lambda x: x.created_at, reverse=True)[:5]

        return Response({
            'total_visits': total_visits,
            'total_books': total_books,
            'total_emails': total_emails,
            'total_reservations': total_reservations,
            'visitors_data': visitors_data,
            'recent_books': [
                {
                    'id': b.id,
                    'title': b.title,
                    'author': b.author,
                    'category': b.category.name if b.category else 'Uncategorized',
                    'dateAdded': b.created_at.strftime('%Y-%m-%d')
                } for b in recent_books
            ],
            'recent_activity': [
                {
                    'id': msg.id,
                    'type': msg.message_type,
                    'name': msg.name,
                    'date': msg.created_at
                } for msg in recent_emails
            ],
            # --- Ratings Analytics ---
            'ratings_summary': self._get_ratings_summary()
        })

    def _get_ratings_summary(self):
        """Compute ratings analytics from Feedback model."""
        all_feedback = self.feedback_service.get_all_feedback()
        total_ratings = len([f for f in all_feedback if f.rating is not None])
        if total_ratings == 0:
            return {
                'total_ratings': 0,
                'average_rating': 0,
                'distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
                'recent_feedback': []
            }

        ratings_list = [f.rating for f in all_feedback if f.rating is not None]
        average_rating = round(sum(ratings_list) / len(ratings_list), 2)
        distribution = {i: ratings_list.count(i) for i in range(1, 6)}

        recent_feedback = sorted(
            [f for f in all_feedback if f.rating is not None],
            key=lambda x: x.created_at, reverse=True
        )[:10]

        return {
            'total_ratings': total_ratings,
            'average_rating': average_rating,
            'distribution': distribution,
            'recent_feedback': [
                {
                    'id': f.id,
                    'name': f.name,
                    'rating': f.rating,
                    'category': f.category,
                    'message': f.message,
                    'created_at': f.created_at.strftime('%Y-%m-%d %H:%M')
                } for f in recent_feedback
            ]
        }

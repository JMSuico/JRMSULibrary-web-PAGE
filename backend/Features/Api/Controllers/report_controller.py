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
from Features.Data.Models.generated_report_model import GeneratedReport
from django.db.models import Q

from Features.Services.Implementations.book_service import NewlyAcquiredBookService

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.visit_service = SiteVisitService(SiteVisitRepository())
        self.book_service = NewlyAcquiredBookService(NewlyAcquiredBookRepository())
        self.contact_service = ContactService()
        self.feedback_service = FeedbackService()

    @action(detail=False, methods=['get'])
    def summary(self, request):
        report_type = request.query_params.get('type', 'summary')
        date_range = request.query_params.get('dateRange', 'this-month')
        data = self._get_summary_data(report_type, date_range)
        return Response(data)

    def _get_summary_data(self, report_type, date_range):
        import datetime
        from django.utils import timezone
        
        today = timezone.now().date()
        cutoff_date = None
        
        if date_range == 'today':
            cutoff_date = today
        elif date_range == 'this-week':
            cutoff_date = today - datetime.timedelta(days=today.weekday())
        elif date_range == 'last-7-days':
            cutoff_date = today - datetime.timedelta(days=7)
        elif date_range == 'this-month':
            cutoff_date = today.replace(day=1)
        elif date_range == 'last-month':
            first_of_this = today.replace(day=1)
            cutoff_date = (first_of_this - datetime.timedelta(days=1)).replace(day=1)
            end_date = first_of_this
        elif date_range == 'this-year':
            cutoff_date = today.replace(month=1, day=1)
            
        all_visits = self.visit_service.get_all_visits()
        all_books = self.book_service.get_all_books()
        all_messages = self.contact_service.get_all_messages()
        
        # Apply filters
        if cutoff_date:
            all_visits = [v for v in all_visits if v.visited_at.date() >= cutoff_date]
            all_books = [b for b in all_books if b.date_encoded and b.date_encoded.date() >= cutoff_date]
            all_messages = [m for m in all_messages if m.created_at.date() >= cutoff_date]
            
            # If last month, also filter before this month
            if date_range == 'last-month':
                all_visits = [v for v in all_visits if v.visited_at.date() < end_date]
                all_books = [b for b in all_books if b.date_encoded and b.date_encoded.date() < end_date]
                all_messages = [m for m in all_messages if m.created_at.date() < end_date]
        
        total_visits = len(all_visits)
        total_books = len(all_books)
        total_emails = len([m for m in all_messages if m.message_type == 'EMAIL'])
        total_reservations = len([m for m in all_messages if m.message_type == 'RESERVATION'])

        recent_emails = sorted([m for m in all_messages if m.message_type in ['EMAIL', 'RESERVATION']], key=lambda x: x.created_at, reverse=True)
        
        # Compute 6-month trends for Advanced Analytics Charts
        today = timezone.now().date()
        trend_data = []
        for i in range(5, -1, -1):
            # Calculate the month and year
            m = (today.month - i - 1) % 12 + 1
            y = today.year + ((today.month - i - 1) // 12)
            month_name = datetime.date(y, m, 1).strftime('%b')
            
            # Count visits in this month
            visits_count = len([v for v in all_visits if v.visited_at.year == y and v.visited_at.month == m])
            # Count books encoded in this month
            books_count = len([b for b in all_books if b.date_encoded and b.date_encoded.year == y and b.date_encoded.month == m])
            
            trend_data.append({
                "name": month_name,
                "visits": visits_count,
                "books": books_count
            })
            
        # Basic book trend — return all books for the table in the period.
        recent_books = sorted(all_books, key=lambda x: x.date_encoded if x.date_encoded else timezone.now(), reverse=True)

        return {
            'total_visits': total_visits,
            'total_books': total_books,
            'total_emails': total_emails,
            'total_reservations': total_reservations,
            'trend_data': trend_data,
            'recent_books': [
                {
                    'id': b.id,
                    'title': b.title,
                    'author': b.author,
                    'category': b.category or 'Uncategorized',
                    'dateAdded': b.date_encoded.strftime('%Y-%m-%d') if b.date_encoded else 'N/A'
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
            'ratings_summary': self._get_ratings_summary(
                cutoff_date=cutoff_date, 
                end_date=end_date if date_range == 'last-month' else None
            )
        }

    def _get_ratings_summary(self, cutoff_date=None, end_date=None):
        """Compute ratings analytics from Feedback model."""
        all_feedback = self.feedback_service.get_all_feedback()
        
        if cutoff_date:
            all_feedback = [f for f in all_feedback if f.created_at.date() >= cutoff_date]
            if end_date:
                all_feedback = [f for f in all_feedback if f.created_at.date() < end_date]

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
        )

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

    @action(detail=False, methods=['post'])
    def generate(self, request):
        report_type = request.data.get('type', 'summary')
        date_range = request.data.get('dateRange', 'this-month')
        title = request.data.get('title', f"Report - {date_range.replace('-', ' ').title()}")
        
        data = self._get_summary_data(report_type, date_range)
        
        report = GeneratedReport.objects.create(
            title=title,
            report_type=report_type,
            date_range=date_range,
            generated_by=request.user if request.user.is_authenticated else None,
            report_data=data
        )
        return Response({
            "message": "Report generated and saved",
            "report_id": report.id,
            "data": data
        })

    @action(detail=False, methods=['get'])
    def history(self, request):
        search = request.query_params.get('search', '')
        limit = int(request.query_params.get('limit', 10))
        offset = int(request.query_params.get('offset', 0))
        
        qs = GeneratedReport.objects.all()
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(report_type__icontains=search))
            
        total = qs.count()
        reports = qs[offset:offset+limit]
        
        return Response({
            "total": total,
            "results": [
                {
                    "id": r.id,
                    "title": r.title,
                    "report_type": r.report_type,
                    "date_range": r.date_range,
                    "generated_at": r.generated_at,
                    "generated_by": f"{r.generated_by.first_name} {r.generated_by.last_name}" if r.generated_by else "System"
                } for r in reports
            ]
        })

    @action(detail=True, methods=['get'])
    def history_detail(self, request, pk=None):
        try:
            report = GeneratedReport.objects.get(pk=pk)
            return Response({
                "id": report.id,
                "title": report.title,
                "report_type": report.report_type,
                "date_range": report.date_range,
                "generated_at": report.generated_at,
                "generated_by": f"{report.generated_by.first_name} {report.generated_by.last_name}" if report.generated_by else "System",
                "data": report.report_data
            })
        except GeneratedReport.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)

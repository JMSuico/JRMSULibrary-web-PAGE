import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api_audit')

class AuditLogMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api/') and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            user = request.user.username if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous'
            ip = self.get_client_ip(request)
            logger.info(f"AUDIT - User: {user} | IP: {ip} | Method: {request.method} | Path: {request.path}")

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

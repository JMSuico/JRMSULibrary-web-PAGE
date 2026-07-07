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

class CSPMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        csp_header = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "img-src 'self' data: blob: https:; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* wss://*;"
        )
        # Apply CSP if not already set
        if 'Content-Security-Policy' not in response:
            response['Content-Security-Policy'] = csp_header
        return response

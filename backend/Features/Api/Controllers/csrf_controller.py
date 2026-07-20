# [Layer: Api/Controllers] — csrf_controller.py
# Provides a public GET endpoint that sets the CSRF cookie and returns the token.
# Required for the public landing page to obtain a valid CSRF token before POSTing
# contact or feedback forms — especially when SESSION cookies are present from a
# previous admin login (which causes DRF to enforce CSRF even on AllowAny views).

from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def get_csrf_token(request):
    """
    GET /api/csrf/
    Sets the csrftoken cookie and returns the token in JSON.
    Called by the public landing page before any form submission.
    """
    return JsonResponse({'csrfToken': get_token(request)})

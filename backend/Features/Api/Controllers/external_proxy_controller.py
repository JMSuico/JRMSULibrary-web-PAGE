# [Layer: Api/Controllers] — external_proxy_controller.py
# Auto-login bridge pages for VitalSource and Scholaar.
# Serves HTML that auto-submits credentials to external login endpoints.
# Credentials are read from environment variables — NEVER hardcoded.

import os
import logging
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from Features.Helpers.external_proxy_helper import (
    fetch_vitalsource_tokens,
    fetch_scholaar_tokens,
)

logger = logging.getLogger(__name__)


def _build_bridge_html(
    title: str,
    login_url: str,
    target_url: str,
    fields: dict,
    brand_color: str = "#002B7F",
) -> str:
    """
    Build an HTML bridge page that:
    1. Shows a branded loading spinner
    2. Auto-submits a hidden form to the external login endpoint
    3. On success, the iframe navigates to the authenticated page
    4. On failure, shows a fallback with 'Open in New Tab' link
    """
    hidden_inputs = "\n".join(
        f'<input type="hidden" name="{k}" value="{v}" />'
        for k, v in fields.items()
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Connecting to {title}...</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #334155;
    }}
    .container {{
      text-align: center;
      padding: 2rem;
      max-width: 420px;
    }}
    .spinner {{
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: {brand_color};
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.5rem;
    }}
    @keyframes spin {{
      to {{ transform: rotate(360deg); }}
    }}
    h2 {{
      font-size: 1.25rem;
      font-weight: 700;
      color: {brand_color};
      margin-bottom: 0.5rem;
    }}
    .subtitle {{
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 2rem;
    }}
    .fallback {{
      display: none;
      margin-top: 2rem;
    }}
    .fallback.visible {{
      display: block;
    }}
    .fallback p {{
      font-size: 0.8125rem;
      color: #94a3b8;
      margin-bottom: 1rem;
    }}
    .btn {{
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: {brand_color};
      color: #fff;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.2s;
    }}
    .btn:hover {{ opacity: 0.9; }}
    .btn-outline {{
      background: transparent;
      color: {brand_color};
      border: 2px solid {brand_color};
      margin-top: 0.75rem;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner" id="spinner"></div>
    <h2 id="status-title">Connecting to {title}</h2>
    <p class="subtitle" id="status-text">Authenticating your session securely...</p>

    <!-- Hidden auto-submit form -->
    <form id="login-form" method="POST" action="{login_url}" style="display:none;">
      {hidden_inputs}
    </form>

    <!-- Fallback UI shown if auto-login fails -->
    <div class="fallback" id="fallback">
      <p>Auto-login was blocked by the external service. Please sign in manually.</p>
      <a class="btn" href="{target_url}" target="_blank" rel="noopener noreferrer">
        Open {title} in New Tab
      </a>
      <br />
      <button class="btn btn-outline" onclick="retryLogin()">
        Retry Auto-Login
      </button>
    </div>
  </div>

  <script>
    var formSubmitted = false;
    var retryCount = 0;
    var MAX_RETRIES = 2;

    function submitLogin() {{
      if (retryCount >= MAX_RETRIES) {{
        showFallback();
        return;
      }}
      retryCount++;
      try {{
        document.getElementById('login-form').submit();
        formSubmitted = true;
      }} catch (e) {{
        showFallback();
      }}
    }}

    function showFallback() {{
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('status-title').textContent = 'Manual Sign-In Required';
      document.getElementById('status-text').textContent = 'The external service requires you to sign in directly.';
      document.getElementById('fallback').classList.add('visible');
    }}

    function retryLogin() {{
      document.getElementById('spinner').style.display = 'block';
      document.getElementById('status-title').textContent = 'Retrying connection...';
      document.getElementById('status-text').textContent = 'Attempting to authenticate again...';
      document.getElementById('fallback').classList.remove('visible');
      retryCount = 0;
      setTimeout(submitLogin, 500);
    }}

    // Auto-submit after a brief delay to let the iframe render
    setTimeout(submitLogin, 800);

    // If after 10 seconds we're still on this page, show fallback
    setTimeout(function() {{
      if (!formSubmitted || document.getElementById('spinner').style.display !== 'none') {{
        showFallback();
      }}
    }}, 10000);
  </script>
</body>
</html>"""


@require_GET
@csrf_exempt
def vitalsource_auto_login(request):
    """
    Serves an HTML bridge page that auto-submits VitalSource login credentials.
    Uses the exact login URL and field names from the VitalSource login form.
    Field names: user[username], user[password] (Ruby on Rails convention).
    """
    email = os.environ.get("VITALSOURCE_EMAIL", "")
    password = os.environ.get("VITALSOURCE_PASSWORD", "")

    if not email or not password:
        return HttpResponse(
            _build_error_html(
                "VitalSource",
                "VitalSource credentials are not configured on this server.",
                "https://bookshelf.vitalsource.com/signin",
            ),
            content_type="text/html",
        )

    # The exact login URL provided by the user (JWT-based auth endpoint)
    login_url = (
        "https://login.vitalsource.com/"
        "?context=store"
        "&redirect_uri=https%3A%2F%2Fwww.vitalsource.com%2F"
        "&locale=en-US"
        "&brand=www.vitalsource.com"
        "&method=jwt"
        "&marketing=true"
        "&role=learner"
        "&auth_host=www.vitalsource.com"
        "&auth_protocol=https%3A"
        "&ux_mode=popup"
    )

    # Fetch CSRF tokens from the login page (Rails authenticity_token)
    tokens = fetch_vitalsource_tokens(login_url)
    logger.info("VitalSource tokens fetched: %s", list(tokens.keys()))

    # Build credential fields with correct form field names
    fields = {
        "user[username]": email,
        "user[password]": password,
    }
    # Merge server-fetched tokens (authenticity_token, utf8, etc.)
    fields.update(tokens)

    html = _build_bridge_html(
        title="VitalSource Bookshelf",
        login_url=login_url,
        target_url="https://bookshelf.vitalsource.com/home/my-library",
        fields=fields,
        brand_color="#0073C6",
    )
    return HttpResponse(html, content_type="text/html")


@require_GET
@csrf_exempt
def scholaar_auto_login(request):
    """
    Serves an HTML bridge page that auto-submits Scholaar login credentials.
    If the Scholaar service is unreachable, immediately shows the fallback UI
    with a direct link instead of making the user wait 10 seconds.
    """
    username = os.environ.get("SCHOLAAR_USERNAME", "")
    password = os.environ.get("SCHOLAAR_PASSWORD", "")

    # Primary login URL — try both HTTP and HTTPS variants
    login_url = "https://scholaar.com/University/HomePage.aspx"
    fallback_direct_url = "https://scholaar.com/University/HomePage.aspx"

    if not username or not password:
        return HttpResponse(
            _build_error_html(
                "Scholaar",
                "Scholaar credentials are not configured on this server.",
                fallback_direct_url,
            ),
            content_type="text/html",
        )

    # Quick connectivity check — if the site is down, show fallback immediately
    import urllib.request
    site_reachable = False
    try:
        req = urllib.request.Request(login_url, method='HEAD')
        urllib.request.urlopen(req, timeout=5)
        site_reachable = True
    except Exception:
        logger.warning("Scholaar login page is unreachable: %s", login_url)
        site_reachable = False

    if not site_reachable:
        # Show a clear error page with a direct link
        return HttpResponse(
            _build_error_html(
                "Scholaar",
                "The Scholaar service appears to be temporarily unavailable. Please try opening it directly or contact your administrator.",
                fallback_direct_url,
            ),
            content_type="text/html",
        )

    # Fetch ASP.NET ViewState tokens from the login page
    tokens = fetch_scholaar_tokens(login_url)
    logger.info("Scholaar tokens fetched: %s", list(tokens.keys()))

    # Build credential fields with correct form field names
    fields = {
        "txtUsername": username,
        "txtPassword": password,
        "btnLogin": "Login",
    }
    # Merge server-fetched tokens (__VIEWSTATE, __EVENTVALIDATION, etc.)
    fields.update(tokens)

    html = _build_bridge_html(
        title="Scholaar Database",
        login_url=login_url,
        target_url="https://scholaar.com/University/HomePage.aspx",
        fields=fields,
        brand_color="#C9A84C",
    )
    return HttpResponse(html, content_type="text/html")


def _build_error_html(title: str, message: str, fallback_url: str) -> str:
    """Build a simple error page when credentials are not configured."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{title} — Configuration Required</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Inter', sans-serif;
      background: #fef2f2;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #991b1b;
    }}
    .container {{ text-align: center; padding: 2rem; max-width: 400px; }}
    h2 {{ font-size: 1.25rem; margin-bottom: 0.5rem; }}
    p {{ font-size: 0.875rem; color: #b91c1c; margin-bottom: 1.5rem; }}
    a {{
      display: inline-block;
      padding: 0.625rem 1.25rem;
      background: #002B7F;
      color: #fff;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
    }}
  </style>
</head>
<body>
  <div class="container">
    <h2>Configuration Required</h2>
    <p>{message}</p>
    <a href="{fallback_url}" target="_blank" rel="noopener noreferrer">Open {title} Manually</a>
  </div>
</body>
</html>"""

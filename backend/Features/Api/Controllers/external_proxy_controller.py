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
from rest_framework.permissions import AllowAny, IsAuthenticated
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vitalsource_auto_login(request):
    """
    Serves an HTML bridge page that provides VitalSource login credentials.
    We cannot auto-submit to VitalSource because modern SPAs block 
    cross-origin form POSTs (HTTP 405 Method Not Allowed).
    """
    email = os.environ.get("VITALSOURCE_EMAIL", "Not Configured")
    password = os.environ.get("VITALSOURCE_PASSWORD", "Not Configured")
    login_url = "https://bookshelf.vitalsource.com/signin"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VitalSource Access</title>
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
      padding: 2.5rem; 
      max-width: 420px; 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }}
    h2 {{ font-size: 1.25rem; font-weight: 700; color: #0073C6; margin-bottom: 0.5rem; }}
    p {{ font-size: 0.875rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }}
    .credentials {{ 
      background: #f1f5f9; 
      padding: 1rem; 
      border-radius: 8px; 
      margin-bottom: 1.5rem; 
      text-align: left;
      border: 1px solid #e2e8f0;
    }}
    .credentials div {{ font-family: monospace; font-size: 0.95rem; }}
    .credentials strong {{ display: inline-block; width: 85px; color: #475569; font-family: 'Inter', sans-serif; font-size: 0.875rem; }}
    .btn {{
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #0073C6;
      color: #fff;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      width: 100%;
    }}
    .btn:hover {{ background: #005a9e; transform: translateY(-1px); }}
  </style>
</head>
<body>
  <div class="container">
    <h2>Access VitalSource Bookshelf</h2>
    <p>Due to security constraints on external libraries, automatic login is disabled. Please use the institutional credentials below:</p>
    
    <div class="credentials">
      <div><strong>Email:</strong> {email}</div>
      <div style="margin-top: 8px;"><strong>Password:</strong> {password}</div>
    </div>

    <a class="btn" href="{login_url}" target="_blank" rel="noopener noreferrer">
      Open VitalSource in New Tab
    </a>
  </div>
</body>
</html>"""
    return HttpResponse(html, content_type="text/html")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def scholaar_auto_login(request):
    """
    Serves an HTML bridge page that provides Scholaar login credentials.
    We cannot auto-submit to Scholaar because it is an ASP.NET WebForms app.
    Cross-origin POSTs without the original ASP.NET_SessionId cookie cause
    NullReferenceExceptions in their Master Page (e.g., Session["plogo"]).
    """
    username = os.environ.get("SCHOLAAR_USERNAME", "Not Configured")
    password = os.environ.get("SCHOLAAR_PASSWORD", "Not Configured")
    login_url = "http://scholaar.com/University/HomePage.aspx"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scholaar Access</title>
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
      padding: 2.5rem; 
      max-width: 420px; 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }}
    h2 {{ font-size: 1.25rem; font-weight: 700; color: #C9A84C; margin-bottom: 0.5rem; }}
    p {{ font-size: 0.875rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }}
    .credentials {{ 
      background: #f1f5f9; 
      padding: 1rem; 
      border-radius: 8px; 
      margin-bottom: 1.5rem; 
      text-align: left;
      border: 1px solid #e2e8f0;
    }}
    .credentials div {{ font-family: monospace; font-size: 0.95rem; }}
    .credentials strong {{ display: inline-block; width: 85px; color: #475569; font-family: 'Inter', sans-serif; font-size: 0.875rem; }}
    .btn {{
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #C9A84C;
      color: #fff;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      width: 100%;
    }}
    .btn:hover {{ background: #b59540; transform: translateY(-1px); }}
  </style>
</head>
<body>
  <div class="container">
    <h2>Access Scholaar Database</h2>
    <p>Scholaar requires manual sign-in due to their strict security policies. Please use the institutional credentials below:</p>
    
    <div class="credentials">
      <div><strong>Username:</strong> {username}</div>
      <div style="margin-top: 8px;"><strong>Password:</strong> {password}</div>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fcd34d; color: #b45309; padding: 12px; border-radius: 8px; font-size: 0.8125rem; text-align: left; margin-bottom: 1.5rem; line-height: 1.4;">
      <strong>Note about security warning:</strong> Scholaar's security certificate has expired. When you open the link below, you may see a "Your connection is not private" error. To access the site, click <strong>"Advanced"</strong> and then click <strong>"Proceed to scholaar.com (unsafe)"</strong>.
    </div>

    <a class="btn" href="{login_url}" target="_blank" rel="noopener noreferrer">
      Open Scholaar in New Tab
    </a>
  </div>
</body>
</html>"""
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

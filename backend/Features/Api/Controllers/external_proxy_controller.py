# [Layer: Api/Controllers] — external_proxy_controller.py
# Secure gateway pages for external institutional library platforms (VitalSource, Scholaar).
# Restricted to authenticated staff/admin users; credentials are never exposed in plaintext HTML.

import html
import logging
import os

from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated

logger = logging.getLogger(__name__)


def _render_gateway_html(
    *,
    page_title: str,
    heading: str,
    description: str,
    account_label: str,
    account_value: str,
    password_configured: bool,
    login_url: str,
    button_label: str,
    brand_color: str,
    hover_color: str,
) -> HttpResponse:
    """Render an HTML-escaped external service gateway page without exposing plaintext secrets."""
    if not login_url.startswith("https://"):
        raise ValueError("External service login_url must use HTTPS.")

    safe_page_title = html.escape(page_title, quote=True)
    safe_heading = html.escape(heading, quote=True)
    safe_description = html.escape(description, quote=True)
    safe_account_label = html.escape(account_label, quote=True)
    safe_account_value = html.escape(account_value or "Not Configured", quote=True)
    safe_password_status = (
        "Configured (managed securely by library administrators)"
        if password_configured
        else "Not Configured"
    )
    safe_login_url = html.escape(login_url, quote=True)
    safe_button_label = html.escape(button_label, quote=True)

    body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{safe_page_title}</title>
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
      max-width: 440px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }}
    h2 {{ font-size: 1.25rem; font-weight: 700; color: {brand_color}; margin-bottom: 0.5rem; }}
    p {{ font-size: 0.875rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }}
    .credentials {{
      background: #f1f5f9;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      text-align: left;
      border: 1px solid #e2e8f0;
    }}
    .credentials div {{ font-family: monospace; font-size: 0.9rem; word-break: break-word; }}
    .credentials strong {{
      display: inline-block;
      min-width: 88px;
      color: #475569;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
    }}
    .btn {{
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: {brand_color};
      color: #ffffff;
      border: none;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      width: 100%;
    }}
    .btn:hover {{ background: {hover_color}; transform: translateY(-1px); }}
  </style>
</head>
<body>
  <div class="container">
    <h2>{safe_heading}</h2>
    <p>{safe_description}</p>

    <div class="credentials">
      <div><strong>{safe_account_label}:</strong> {safe_account_value}</div>
      <div style="margin-top: 8px;"><strong>Password:</strong> {safe_password_status}</div>
    </div>

    <a class="btn" href="{safe_login_url}" target="_blank" rel="noopener noreferrer">
      {safe_button_label}
    </a>
  </div>
</body>
</html>"""

    response = HttpResponse(body, content_type="text/html; charset=utf-8")
    response["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
    response["Pragma"] = "no-cache"
    response["Referrer-Policy"] = "no-referrer"
    response["X-Content-Type-Options"] = "nosniff"
    response["Content-Security-Policy"] = (
        "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none';"
    )
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def vitalsource_auto_login(request):
    """Serve an admin-only gateway page for VitalSource Bookshelf over HTTPS without exposing secrets."""
    email = os.environ.get("VITALSOURCE_EMAIL", "Not Configured")
    password_configured = bool(os.environ.get("VITALSOURCE_PASSWORD"))
    return _render_gateway_html(
        page_title="VitalSource Access",
        heading="Access VitalSource Bookshelf",
        description=(
            "Sign in directly on the VitalSource portal over HTTPS. "
            "Plaintext institutional passwords are hidden from browser responses for security."
        ),
        account_label="Email",
        account_value=email,
        password_configured=password_configured,
        login_url="https://bookshelf.vitalsource.com/signin",
        button_label="Open VitalSource in New Tab",
        brand_color="#0073C6",
        hover_color="#005a9e",
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def scholaar_auto_login(request):
    """Serve an admin-only gateway page for Scholaar over HTTPS without exposing secrets."""
    username = os.environ.get("SCHOLAAR_USERNAME", "Not Configured")
    password_configured = bool(os.environ.get("SCHOLAAR_PASSWORD"))
    return _render_gateway_html(
        page_title="Scholaar Access",
        heading="Access Scholaar Database",
        description=(
            "Sign in directly on the Scholaar portal over HTTPS. "
            "Plaintext institutional passwords are hidden from browser responses for security."
        ),
        account_label="Username",
        account_value=username,
        password_configured=password_configured,
        login_url="https://scholaar.com/University/HomePage.aspx",
        button_label="Open Scholaar in New Tab",
        brand_color="#C9A84C",
        hover_color="#b59540",
    )

import ipaddress
import logging
import os
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api_audit')

_DEFAULT_TRUSTED_PROXY_NETWORKS = (
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
)

_SENSITIVE_FIELD_MARKERS = ("password", "token", "secret", "authorization", "cookie", "api_key")


def _parse_ip(raw_value):
    if not raw_value:
        return None
    candidate = str(raw_value).strip()
    if not candidate:
        return None
    try:
        return ipaddress.ip_address(candidate)
    except ValueError:
        return None


def _get_trusted_proxy_networks():
    raw_setting = None
    try:
        if settings.configured:
            raw_setting = getattr(settings, "TRUSTED_PROXY_IPS", None)
    except Exception:
        raw_setting = None

    if raw_setting is None:
        raw_setting = os.environ.get("TRUSTED_PROXY_IPS", "")

    if isinstance(raw_setting, str):
        entries = [item.strip() for item in raw_setting.split(",") if item.strip()]
    elif isinstance(raw_setting, (list, tuple, set)):
        entries = [str(item).strip() for item in raw_setting if str(item).strip()]
    else:
        entries = []

    if not entries:
        return _DEFAULT_TRUSTED_PROXY_NETWORKS

    networks = []
    for entry in entries:
        try:
            networks.append(ipaddress.ip_network(entry, strict=False))
        except ValueError:
            continue
    return tuple(networks) if networks else _DEFAULT_TRUSTED_PROXY_NETWORKS


def _is_trusted_proxy(ip_obj, trusted_networks):
    return any(ip_obj in net for net in trusted_networks)


def _sanitize_log_value(value):
    return str(value).replace("\r", "").replace("\n", "")


def redact_sensitive_fields(mapping):
    """Return a copy of mapping with sensitive keys (password, token, secret, etc.) masked."""
    if not isinstance(mapping, dict):
        return mapping
    redacted = {}
    for key, val in mapping.items():
        key_lower = str(key).lower()
        if any(marker in key_lower for marker in _SENSITIVE_FIELD_MARKERS):
            redacted[key] = "[REDACTED]"
        elif isinstance(val, dict):
            redacted[key] = redact_sensitive_fields(val)
        else:
            redacted[key] = val
    return redacted


def get_client_ip(request):
    """
    Safely resolve the client IP without trusting spoofed left-most X-Forwarded-For headers.
    Proxy headers (CF-Connecting-IP / X-Forwarded-For) are only consulted when REMOTE_ADDR
    belongs to a configured trusted proxy; X-Forwarded-For is walked right-to-left to pick
    the right-most untrusted hop.
    """
    remote_raw = (request.META.get("REMOTE_ADDR") or "").strip()
    remote_ip = _parse_ip(remote_raw)
    if remote_ip is None:
        return None

    trusted_networks = _get_trusted_proxy_networks()
    if not _is_trusted_proxy(remote_ip, trusted_networks):
        return str(remote_ip)

    cf_ip = _parse_ip(request.META.get("HTTP_CF_CONNECTING_IP"))
    if cf_ip is not None:
        return str(cf_ip)

    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        raw_hops = [hop.strip() for hop in str(x_forwarded_for).split(",") if hop.strip()]
        for raw_hop in reversed(raw_hops):
            hop_ip = _parse_ip(raw_hop)
            if hop_ip is None:
                return str(remote_ip)
            if not _is_trusted_proxy(hop_ip, trusted_networks):
                return str(hop_ip)
        if raw_hops:
            first_ip = _parse_ip(raw_hops[0])
            if first_ip is not None:
                return str(first_ip)

    return str(remote_ip)


class AuditLogMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/api/') and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            user = request.user.username if hasattr(request, 'user') and request.user.is_authenticated else 'Anonymous'
            ip = self.get_client_ip(request)
            # Intentionally log only method + path (never request body/query params with password/token/secret).
            logger.info(
                f"AUDIT - User: {_sanitize_log_value(user)} | "
                f"IP: {_sanitize_log_value(ip)} | "
                f"Method: {_sanitize_log_value(request.method)} | "
                f"Path: {_sanitize_log_value(request.path)}"
            )

    def get_client_ip(self, request):
        return get_client_ip(request)


class CSPMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        csp_header = (
            "default-src 'self'; "
            "base-uri 'self'; "
            "object-src 'self' blob:; "
            "worker-src 'self' blob:; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "img-src 'self' data: blob: https:; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:* https://*.jrmsukc-library.online wss://*.jrmsukc-library.online https://*.cloudflare.com; "
            "frame-src 'self' blob: data: https://maps.google.com https://www.google.com https://*.google.com https://*.googleapis.com https://*.openstreetmap.org https://*.vitalsource.com https://*.scholaar.com https://*.jrmsukc-library.online; "
            "frame-ancestors 'self' http://localhost:* http://127.0.0.1:* https://*.jrmsukc-library.online https://jrmsukc-library.online https://*.jrmsukclibrary.com https://jrmsukclibrary.com;"
        )
        # Apply CSP if not already set
        if 'Content-Security-Policy' not in response:
            response['Content-Security-Policy'] = csp_header
        return response


class GlobalSecurityHeadersMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # 1. Block old plugins from pretending malicious files are images
        response['X-Content-Type-Options'] = 'nosniff'

        # 2. Prevent application URLs from leaking to 3rd-party APIs used by plugins
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # 3. Mathematically revoke Hardware access (Microphone, Camera, Geolocation) from ALL plugins globally
        response['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()'

        return response

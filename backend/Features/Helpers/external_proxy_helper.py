# [Layer: Helpers] — external_proxy_helper.py
# Reusable support utility for fetching hidden form tokens from external login pages.
# Used by external_proxy_controller to build bridge pages with valid CSRF/ViewState tokens.
# No full workflows, no DB calls — pure utility.

import re
import logging
import requests

logger = logging.getLogger(__name__)

# Shared timeout for all external HTTP requests (seconds)
_REQUEST_TIMEOUT = 10


def fetch_vitalsource_tokens(login_url: str) -> dict:
    """
    Fetch the VitalSource login page and extract the Rails CSRF
    authenticity_token required for a valid form POST.

    Returns a dict of hidden field name → value pairs.
    Returns empty dict on failure (caller should proceed without tokens).
    """
    try:
        resp = requests.get(login_url, timeout=_REQUEST_TIMEOUT, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        resp.raise_for_status()
        html = resp.text

        tokens = {}

        # Rails CSRF token — look for <input name="authenticity_token" ...>
        auth_match = re.search(
            r'<input[^>]*name=["\']authenticity_token["\'][^>]*value=["\']([^"\']+)["\']',
            html,
            re.IGNORECASE,
        )
        if auth_match:
            tokens["authenticity_token"] = auth_match.group(1)
            logger.info("VitalSource: extracted authenticity_token")

        # Also check for meta tag CSRF (Rails sometimes uses this)
        if "authenticity_token" not in tokens:
            meta_match = re.search(
                r'<meta\s+name=["\']csrf-token["\'][^>]*content=["\']([^"\']+)["\']',
                html,
                re.IGNORECASE,
            )
            if meta_match:
                tokens["authenticity_token"] = meta_match.group(1)
                logger.info("VitalSource: extracted CSRF from meta tag")

        # Extract any other hidden inputs in the login form
        for hidden in re.finditer(
            r'<input[^>]*type=["\']hidden["\'][^>]*name=["\']([^"\']+)["\'][^>]*value=["\']([^"\']*)["\']',
            html,
            re.IGNORECASE,
        ):
            name = hidden.group(1)
            value = hidden.group(2)
            if name not in tokens and name not in ("utf8",):
                tokens[name] = value

        # Also capture utf8 checkbox if present (Rails forms)
        utf8_match = re.search(
            r'<input[^>]*name=["\']utf8["\'][^>]*value=["\']([^"\']*)["\']',
            html,
            re.IGNORECASE,
        )
        if utf8_match:
            tokens["utf8"] = utf8_match.group(1)

        return tokens

    except Exception as e:
        logger.warning("Failed to fetch VitalSource login tokens: %s", e)
        return {}


def fetch_scholaar_tokens(login_url: str) -> dict:
    """
    Fetch the Scholaar Login.aspx page and extract ASP.NET WebForms
    hidden fields: __VIEWSTATE, __VIEWSTATEGENERATOR, __EVENTVALIDATION.

    Returns a dict of hidden field name → value pairs.
    Returns empty dict on failure (caller should proceed without tokens).
    """
    try:
        resp = requests.get(login_url, timeout=_REQUEST_TIMEOUT, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        resp.raise_for_status()
        html = resp.text

        tokens = {}

        # Extract all ASP.NET hidden fields
        aspnet_fields = [
            "__VIEWSTATE",
            "__VIEWSTATEGENERATOR",
            "__EVENTVALIDATION",
            "__EVENTTARGET",
            "__EVENTARGUMENT",
        ]

        for field_name in aspnet_fields:
            pattern = (
                r'<input[^>]*name=["\']'
                + re.escape(field_name)
                + r'["\'][^>]*value=["\']([^"\']*)["\']'
            )
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                tokens[field_name] = match.group(1)
                logger.info("Scholaar: extracted %s", field_name)

        # Also try id-based extraction (ASP.NET sometimes uses id instead of name)
        for field_name in aspnet_fields:
            if field_name not in tokens:
                pattern = (
                    r'id=["\']'
                    + re.escape(field_name)
                    + r'["\'][^>]*value=["\']([^"\']*)["\']'
                )
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    tokens[field_name] = match.group(1)
                    logger.info("Scholaar: extracted %s (via id)", field_name)

        return tokens

    except Exception as e:
        logger.warning("Failed to fetch Scholaar login tokens: %s", e)
        return {}

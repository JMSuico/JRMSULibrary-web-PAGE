# [Layer: Helpers] — input_sanitizer.py
# Cleans and sanitizes all public form submissions to guard against XSS.
# Do NOT put business rules here — pure utility functions only.

import html
import re

def sanitize_input(value: str) -> str:
    """
    Sanitize untrusted user input by stripping HTML tags and escaping entities.
    """
    if not isinstance(value, str):
        return value
        
    # Strip HTML tags entirely using a regex
    clean_text = re.sub(r'<[^>]+>', '', value)
    
    # Escape any remaining special characters like & < > " '
    escaped_text = html.escape(clean_text)
    
    return escaped_text.strip()

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class CustomPasswordValidator:
    def validate(self, password, user=None):
        if len(password) < 10:
            raise ValidationError(
                _("Password must be at least 10 characters long."),
                code='password_too_short',
            )
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("Password must contain at least one uppercase letter (A-Z)."),
                code='password_no_upper',
            )
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("Password must contain at least one lowercase letter (a-z)."),
                code='password_no_lower',
            )
        if not re.search(r'\d', password):
            raise ValidationError(
                _("Password must contain at least one number (0-9)."),
                code='password_no_number',
            )
        if not re.search(r'[!@#$%^&*]', password):
            raise ValidationError(
                _("Password must contain at least one special character (!@#$%^&*)."),
                code='password_no_special',
            )

    def get_help_text(self):
        return _(
            "Your password must contain at least 10 characters, 1 uppercase, "
            "1 lowercase, 1 number, and 1 special character (!@#$%^&*)."
        )

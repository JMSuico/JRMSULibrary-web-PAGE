# [Layer: management/commands] — createsuperuser_custom.py
"""
Custom createsuperuser command for JRMSU Library Admin.
Interactive menu with default account creation and custom input flow.
"""
import getpass

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

DEFAULT_USERNAME = 'JRMSU-KATIPUNAN-CAMPUS-Library-Admin'
DEFAULT_EMAIL = 'librarian@jrmsu.edu.ph'
DEFAULT_PASSWORD = 'JRMSU-KATIPUNAN-CAMPUS-Library-Admin@7109'
DEFAULT_FIRST_NAME = 'JRMSU Library'
DEFAULT_LAST_NAME = 'Administrator'


class Command(BaseCommand):
    help = 'Create a superuser for JRMSU Library Admin with interactive menu'

    def handle(self, *args, **options):
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write('  JRMSU Katipunan Campus Library — Super Admin Setup')
        self.stdout.write('=' * 60)
        self.stdout.write('\nPASSWORD REQUIREMENTS (enforced):')
        self.stdout.write('  - At least 10 characters')
        self.stdout.write('  - At least 1 uppercase letter (A-Z)')
        self.stdout.write('  - At least 1 lowercase letter (a-z)')
        self.stdout.write('  - At least 1 number (0-9)')
        self.stdout.write('  - At least 1 special character (!@#$%^&*)')
        self.stdout.write('\nNote: The same policy applies to `python manage.py createsuperuser`.')
        self.stdout.write('      Use this command (`createsuperuser_custom`) for a guided setup.\n')
        self.stdout.write('Select an option:')
        self.stdout.write('  [1] Create default Library Admin account (recommended)')
        self.stdout.write('  [2] Enter custom superuser details')
        self.stdout.write('  [0] Cancel\n')

        choice = input('Select option (1/2/0): ').strip()

        if choice == '0':
            self.stdout.write(self.style.WARNING('Cancelled.'))
            return

        if choice == '1':
            self._create_default()
        elif choice == '2':
            self._create_custom()
        else:
            self.stdout.write(self.style.ERROR('Invalid option.'))

    def _create_default(self):
        """Create a default Library Admin account with preset credentials."""
        if User.objects.filter(username=DEFAULT_USERNAME).exists():
            self.stdout.write(self.style.WARNING(
                f'User "{DEFAULT_USERNAME}" already exists. Skipping.'
            ))
            return

        user = User.objects.create_superuser(
            username=DEFAULT_USERNAME,
            email=DEFAULT_EMAIL,
            password=DEFAULT_PASSWORD,
            first_name=DEFAULT_FIRST_NAME,
            last_name=DEFAULT_LAST_NAME,
        )
        user.is_librarian = True
        user.is_guest = False
        user.save()

        self.stdout.write(self.style.SUCCESS(
            f'\nDefault Library Admin "{DEFAULT_USERNAME}" created successfully!'
        ))
        self.stdout.write(f'   Username:  {DEFAULT_USERNAME}')
        self.stdout.write(f'   Email:     {DEFAULT_EMAIL}')
        self.stdout.write(f'   Password:  {DEFAULT_PASSWORD}')
        self.stdout.write(f'   Role:      SuperAdmin / Librarian')
        self.stdout.write(f'   is_staff:  True')
        self.stdout.write(f'   is_super:  True')
        self.stdout.write(f'   is_libr:   True\n')

    def _create_custom(self):
        """Create a custom superuser account with user-provided fields."""
        username = input('Username: ').strip()
        if not username:
            self.stdout.write(self.style.ERROR('Username is required.'))
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User "{username}" already exists.'))
            return

        email = input('Email: ').strip()
        first_name = input('First Name: ').strip()
        last_name = input('Last Name: ').strip()

        self.stdout.write('\nPassword Requirements: 10+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special (!@#$%^&*)')
        password = getpass.getpass('Password: ')
        confirm = getpass.getpass('Confirm Password: ')
        if password != confirm:
            self.stdout.write(self.style.ERROR('Passwords do not match.'))
            return

        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        try:
            validate_password(password)
        except ValidationError as e:
            for msg in e.messages:
                self.stdout.write(self.style.ERROR(msg))
            return

        user = User.objects.create_superuser(
            username=username,
            email=email or '',
            password=password,
            first_name=first_name or '',
            last_name=last_name or '',
        )
        user.is_librarian = True
        user.is_guest = False
        user.save()

        self.stdout.write(self.style.SUCCESS(
            f'\nCustom superuser "{username}" created successfully!'
        ))
        self.stdout.write(f'   Role:      SuperAdmin / Librarian')
        self.stdout.write(f'   is_staff:  True')
        self.stdout.write(f'   is_super:  True')
        self.stdout.write(f'   is_libr:   True\n')

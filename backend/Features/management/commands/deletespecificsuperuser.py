import sys
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'List and delete terminal-created superusers'

    def handle(self, *args, **options):
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write('  JRMSU Katipunan Campus Library — Terminal Admin Manager')
        self.stdout.write('=' * 60)

        terminal_admins = User.objects.filter(is_terminal_created=True)
        if not terminal_admins.exists():
            self.stdout.write(self.style.WARNING('\nNo terminal-created admins found.'))
            return

        self.stdout.write('\nTerminal-Created Admins:')
        for admin in terminal_admins:
            self.stdout.write(f'  - {admin.username}')

        self.stdout.write('\nOptions:')
        self.stdout.write('  [1] Delete a specific terminal-created admin')
        self.stdout.write('  [2] Delete ALL terminal-created admins')
        self.stdout.write('  [0] Cancel\n')

        choice = input('Select option (1/2/0): ').strip()

        if choice == '0':
            self.stdout.write(self.style.WARNING('Cancelled.'))
            return
            
        elif choice == '1':
            target_username = input('\nEnter the exact username to delete: ').strip()
            target_admin = terminal_admins.filter(username=target_username).first()
            if not target_admin:
                self.stdout.write(self.style.ERROR(f'No terminal-created admin found with username "{target_username}".'))
                return
                
            confirm = input(f'Are you sure you want to permanently delete "{target_username}"? (y/n): ').strip().lower()
            if confirm == 'y':
                target_admin.delete()
                self.stdout.write(self.style.SUCCESS(f'Successfully deleted terminal-created admin "{target_username}".'))
            else:
                self.stdout.write(self.style.WARNING('Cancelled deletion.'))
                
        elif choice == '2':
            confirm = input(f'\nAre you sure you want to permanently delete ALL {terminal_admins.count()} terminal-created admins? (y/n): ').strip().lower()
            if confirm == 'y':
                count = terminal_admins.count()
                terminal_admins.delete()
                self.stdout.write(self.style.SUCCESS(f'Successfully deleted all {count} terminal-created admins.'))
            else:
                self.stdout.write(self.style.WARNING('Cancelled bulk deletion.'))
        else:
            self.stdout.write(self.style.ERROR('Invalid option.'))

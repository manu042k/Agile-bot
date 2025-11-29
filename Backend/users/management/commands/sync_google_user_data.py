"""
Management command to sync Google user data for existing users
Usage: python manage.py sync_google_user_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User


class Command(BaseCommand):
    help = 'Sync Google user data for existing users from session data'

    def handle(self, *args, **options):
        self.stdout.write('Starting Google user data sync...')
        
        # Find users without names
        users_to_update = User.objects.filter(
            first_name='',
            google_id__isnull=False
        )
        
        total = users_to_update.count()
        self.stdout.write(f'Found {total} users to update')
        
        if total == 0:
            self.stdout.write(self.style.SUCCESS('All users already have names!'))
            return
        
        updated = 0
        for user in users_to_update:
            # Set placeholder names from email if no other data available
            if not user.first_name and not user.last_name:
                email_username = user.email.split('@')[0]
                # Try to split email username into first/last name
                parts = email_username.replace('.', ' ').replace('_', ' ').split()
                if len(parts) >= 2:
                    user.first_name = parts[0].capitalize()
                    user.last_name = ' '.join(parts[1:]).capitalize()
                else:
                    user.first_name = email_username.capitalize()
                    user.last_name = ''
                
                user.google_data_synced_at = timezone.now()
                user.save()
                updated += 1
                self.stdout.write(f'Updated: {user.email} -> {user.get_full_name()}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated} users'))
        self.stdout.write(self.style.WARNING(
            'Note: Names are derived from email. '
            'They will be updated with real Google data on next login.'
        ))

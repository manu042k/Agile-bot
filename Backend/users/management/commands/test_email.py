"""
Django management command to test email functionality
Usage: python manage.py test_email --email test@example.com
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from users.models import User, Team, TeamInvitation
from users.email_utils import send_team_invitation_email
from django.utils import timezone
from datetime import timedelta
import secrets


class Command(BaseCommand):
    help = 'Test email functionality'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to send test email to',
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['basic', 'invitation'],
            default='basic',
            help='Type of email test (basic or invitation)',
        )

    def handle(self, *args, **options):
        email = options.get('email')
        test_type = options.get('type')

        self.stdout.write(self.style.SUCCESS('\n' + '=' * 60))
        self.stdout.write(self.style.SUCCESS('Email Functionality Test'))
        self.stdout.write(self.style.SUCCESS('=' * 60 + '\n'))

        # Display email configuration
        self.stdout.write('Email Configuration:')
        self.stdout.write(f'  EMAIL_HOST: {settings.EMAIL_HOST}')
        self.stdout.write(f'  EMAIL_PORT: {settings.EMAIL_PORT}')
        self.stdout.write(f'  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')
        self.stdout.write(f'  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}')
        self.stdout.write(f'  FRONTEND_URL: {getattr(settings, "FRONTEND_URL", "Not set")}\n')

        if not email:
            self.stdout.write(self.style.WARNING('⚠️  No email provided. Use --email flag to specify recipient.'))
            self.stdout.write(self.style.WARNING('Example: python manage.py test_email --email test@example.com'))
            return

        if test_type == 'basic':
            self.test_basic_email(email)
        elif test_type == 'invitation':
            self.test_invitation_email(email)

    def test_basic_email(self, email):
        """Test basic email sending"""
        self.stdout.write(f'\nTesting Basic Email...')
        self.stdout.write(f'Sending test email to: {email}\n')

        try:
            send_mail(
                subject='Test Email from Project Management System',
                message='This is a test email to verify SMTP configuration.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS('✅ Test email sent successfully!'))
            self.stdout.write(self.style.SUCCESS(f'Check {email} inbox for the test email.\n'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Failed to send test email: {str(e)}'))
            self.stdout.write(self.style.WARNING('\nTroubleshooting:'))
            self.stdout.write(self.style.WARNING('1. Check EMAIL_HOST, EMAIL_PORT, EMAIL_USE_TLS in settings'))
            self.stdout.write(self.style.WARNING('2. Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env'))
            self.stdout.write(self.style.WARNING('3. For Gmail, use App Password (not regular password)'))
            self.stdout.write(self.style.WARNING('4. Check firewall/network settings\n'))

    def test_invitation_email(self, email):
        """Test team invitation email"""
        self.stdout.write(f'\nTesting Team Invitation Email...')
        self.stdout.write(f'Sending invitation to: {email}\n')

        # Check if we have users and teams
        user_count = User.objects.count()
        team_count = Team.objects.count()

        if user_count == 0:
            self.stdout.write(self.style.ERROR('❌ No users found. Please create a user first.'))
            return

        if team_count == 0:
            self.stdout.write(self.style.ERROR('❌ No teams found. Please create a team first.'))
            return

        # Get first user and team
        user = User.objects.first()
        team = Team.objects.first()

        self.stdout.write(f'Using:')
        self.stdout.write(f'  User: {user.email}')
        self.stdout.write(f'  Team: {team.name}\n')

        try:
            # Create invitation
            token = secrets.token_urlsafe(32)
            invitation = TeamInvitation.objects.create(
                team=team,
                email=email,
                role='member',
                invited_by=user,
                token=token,
                status='pending',
                expires_at=timezone.now() + timedelta(days=7)
            )

            self.stdout.write(f'Created invitation:')
            self.stdout.write(f'  Token: {token[:20]}...')
            self.stdout.write(f'  Email: {invitation.email}')
            self.stdout.write(f'  Team: {invitation.team.name}')
            self.stdout.write(f'  Role: {invitation.role}\n')

            # Send invitation email
            self.stdout.write('Sending invitation email...')
            success = send_team_invitation_email(invitation)

            if success:
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
                self.stdout.write(self.style.SUCCESS('✅ Invitation email sent successfully!'))
                self.stdout.write(self.style.SUCCESS(f'\nInvitation link:'))
                self.stdout.write(self.style.SUCCESS(f'{frontend_url}/invitations/accept?token={token}\n'))
            else:
                self.stdout.write(self.style.ERROR('❌ Failed to send invitation email'))
                invitation.delete()  # Clean up

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
            import traceback
            traceback.print_exc()


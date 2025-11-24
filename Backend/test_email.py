#!/usr/bin/env python
"""
Test script for email functionality
Run with: python test_email.py
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agileBotApis.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from users.models import User, Team, TeamInvitation
from users.email_utils import send_team_invitation_email
from django.utils import timezone
from datetime import timedelta
import secrets

def test_basic_email():
    """Test basic email sending"""
    print("=" * 60)
    print("Testing Basic Email Configuration")
    print("=" * 60)
    
    # Check email settings
    print(f"\nEmail Configuration:")
    print(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"  EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print(f"  FRONTEND_URL: {getattr(settings, 'FRONTEND_URL', 'Not set')}")
    
    # Get test email from user or use default
    test_email = input("\nEnter test email address (or press Enter to skip): ").strip()
    
    if not test_email:
        print("Skipping email test (no email provided)")
        return False
    
    try:
        print(f"\nSending test email to {test_email}...")
        send_mail(
            subject='Test Email from Project Management System',
            message='This is a test email to verify SMTP configuration.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[test_email],
            fail_silently=False,
        )
        print("✅ Test email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to send test email: {str(e)}")
        return False


def test_invitation_email():
    """Test team invitation email"""
    print("\n" + "=" * 60)
    print("Testing Team Invitation Email")
    print("=" * 60)
    
    # Check if we have users and teams
    user_count = User.objects.count()
    team_count = Team.objects.count()
    
    print(f"\nDatabase Status:")
    print(f"  Users: {user_count}")
    print(f"  Teams: {team_count}")
    
    if user_count == 0:
        print("⚠️  No users found. Please create a user first.")
        return False
    
    if team_count == 0:
        print("⚠️  No teams found. Please create a team first.")
        return False
    
    # Get first user and team
    user = User.objects.first()
    team = Team.objects.first()
    
    print(f"\nUsing:")
    print(f"  User: {user.email}")
    print(f"  Team: {team.name}")
    
    # Get test email
    test_email = input("\nEnter email address to send invitation to: ").strip()
    
    if not test_email:
        print("Skipping invitation test (no email provided)")
        return False
    
    try:
        # Create invitation
        token = secrets.token_urlsafe(32)
        invitation = TeamInvitation.objects.create(
            team=team,
            email=test_email,
            role='member',
            invited_by=user,
            token=token,
            status='pending',
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        print(f"\nCreated invitation:")
        print(f"  Token: {token[:20]}...")
        print(f"  Email: {invitation.email}")
        print(f"  Team: {invitation.team.name}")
        print(f"  Role: {invitation.role}")
        
        # Send invitation email
        print(f"\nSending invitation email...")
        success = send_team_invitation_email(invitation)
        
        if success:
            print("✅ Invitation email sent successfully!")
            print(f"\nInvitation link: {getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/invitations/accept?token={token}")
            return True
        else:
            print("❌ Failed to send invitation email")
            invitation.delete()  # Clean up
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function"""
    print("\n" + "=" * 60)
    print("Email Functionality Test")
    print("=" * 60)
    
    print("\nChoose test:")
    print("1. Test basic email sending")
    print("2. Test team invitation email")
    print("3. Test both")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        test_basic_email()
    elif choice == "2":
        test_invitation_email()
    elif choice == "3":
        test_basic_email()
        test_invitation_email()
    else:
        print("Invalid choice")


if __name__ == "__main__":
    main()


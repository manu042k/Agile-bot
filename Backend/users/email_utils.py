"""
Email utility functions for sending team invitations
"""
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_team_invitation_email(invitation):
    """
    Send team invitation email to the invited user
    
    Args:
        invitation: TeamInvitation instance
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        team = invitation.team
        inviter = invitation.invited_by
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        accept_url = f"{frontend_url}/invitations/accept?token={invitation.token}"
        
        # Get inviter name (from Google SSO session or email)
        inviter_name = getattr(inviter, 'full_name', None) or inviter.email.split('@')[0]
        
        # Email subject
        subject = f"You've been invited to join {team.name}"
        
        # Email body (plain text)
        message = f"""
Hello!

{inviter_name} has invited you to join the team "{team.name}" on our project management platform.

Team: {team.name}
Role: {invitation.role.title()}
Invited by: {inviter_name}

Click the link below to accept the invitation:
{accept_url}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

Best regards,
Project Management Team
"""
        
        # HTML version
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #111827; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 30px; background-color: #f9fafb; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #111827; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .button:hover {{ background-color: #1f2937; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Team Invitation</h1>
        </div>
        <div class="content">
            <p>Hello!</p>
            <p><strong>{inviter_name}</strong> has invited you to join the team <strong>"{team.name}"</strong> on our project management platform.</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>Team:</strong> {team.name}</p>
                <p><strong>Role:</strong> {invitation.role.title()}</p>
                <p><strong>Invited by:</strong> {inviter_name}</p>
            </div>
            
            <div style="text-align: center;">
                <a href="{accept_url}" class="button">Accept Invitation</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>Project Management Team</p>
        </div>
    </div>
</body>
</html>
"""
        
        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invitation.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Invitation email sent to {invitation.email} for team {team.name}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send invitation email to {invitation.email}: {str(e)}")
        return False


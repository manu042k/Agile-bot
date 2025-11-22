"""
Custom authentication class for Django REST Framework
Handles session-based authentication with 12-hour expiration
"""
from rest_framework.authentication import SessionAuthentication
from django.contrib.sessions.models import Session
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta

User = get_user_model()


class CustomSessionAuthentication(SessionAuthentication):
    """
    Custom session authentication that validates 12-hour session expiration
    Extends Django's SessionAuthentication to add custom expiration logic
    """
    
    def authenticate(self, request):
        """
        Authenticate the request using Django session.
        Returns (user, None) if valid, None if invalid/expired.
        """
        # First, try Django's built-in session authentication
        result = super().authenticate(request)
        
        if result is None:
            return None
        
        user, auth = result
        
        # Get session key from cookie
        session_key = request.COOKIES.get('sessionid')
        
        if not session_key:
            return None
        
        try:
            # Get session from database
            session = Session.objects.get(session_key=session_key)
        except Session.DoesNotExist:
            return None
        
        # Decode session data
        session_data = session.get_decoded()
        
        # Check if session was created more than 12 hours ago
        session_created = session_data.get('session_created')
        if session_created:
            try:
                created_time = datetime.fromisoformat(session_created.replace('Z', '+00:00'))
                if timezone.is_naive(created_time):
                    created_time = timezone.make_aware(created_time)
                
                if timezone.now() - created_time > timedelta(hours=12):
                    # Session expired - delete it
                    session.delete()
                    return None
            except (ValueError, AttributeError):
                # If we can't parse the date, allow the session (fallback)
                pass
        
        # Check if user is active
        if not user.is_active:
            return None
        
        return (user, None)

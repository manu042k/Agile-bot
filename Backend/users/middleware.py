"""
Custom middleware to exempt API routes from CSRF protection
"""
from django.utils.deprecation import MiddlewareMixin
from django.views.decorators.csrf import csrf_exempt


class DisableCSRFForAPI(MiddlewareMixin):
    """
    Middleware to disable CSRF for API endpoints
    This runs before CSRF middleware to exempt API routes
    """
    
    def process_request(self, request):
        # Exempt all API routes from CSRF
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None


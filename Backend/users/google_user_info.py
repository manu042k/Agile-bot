"""
Utility to fetch user info from Google when needed
"""
import os
import requests
from django.core.cache import cache
from django.conf import settings


def get_google_user_info_cached(google_id, access_token=None):
    """
    Get user info from Google with caching.
    If access_token is provided, fetches fresh data.
    Otherwise, returns cached data if available.
    """
    cache_key = f"google_user_{google_id}"
    
    # Try cache first if no access token
    if not access_token:
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
    
    # Fetch from Google API
    if access_token:
        try:
            user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
            headers = {'Authorization': f'Bearer {access_token}'}
            
            response = requests.get(user_info_url, headers=headers, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            
            # Cache for 1 hour
            cache.set(cache_key, data, 3600)
            
            return data
        except Exception as e:
            # If fetch fails, try cache as fallback
            cached_data = cache.get(cache_key)
            if cached_data:
                return cached_data
            raise
    
    return None


def get_user_display_info(user):
    """
    Get display information for a user.
    Fetches from Google if needed, otherwise returns minimal info.
    """
    if not user.google_id:
        return {
            'email': user.email,
            'first_name': '',
            'last_name': '',
            'avatar_url': '',
        }
    
    # Try to get from cache or session
    google_info = get_google_user_info_cached(user.google_id)
    
    if google_info:
        return {
            'email': google_info.get('email', user.email),
            'first_name': google_info.get('given_name', ''),
            'last_name': google_info.get('family_name', ''),
            'avatar_url': google_info.get('picture', ''),
        }
    
    # Fallback to just email
    return {
        'email': user.email,
        'first_name': '',
        'last_name': '',
        'avatar_url': '',
    }


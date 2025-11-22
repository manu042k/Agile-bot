"""
Google OAuth authentication utilities
"""
import os
import requests
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


def get_google_oauth_url():
    """
    Generate Google OAuth authorization URL
    """
    client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
    redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost:8000/api/accounts/auth/google/callback/')
    scope = 'openid email profile'
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    
    return auth_url


def exchange_code_for_token(code):
    """
    Exchange authorization code for access token
    """
    client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')
    redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost:8000/api/accounts/auth/google/callback/')
    
    token_url = 'https://oauth2.googleapis.com/token'
    
    data = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }
    
    response = requests.post(token_url, data=data)
    response.raise_for_status()
    
    return response.json()


def get_google_user_info(access_token):
    """
    Get user information from Google using access token
    """
    user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
    headers = {'Authorization': f'Bearer {access_token}'}
    
    response = requests.get(user_info_url, headers=headers)
    response.raise_for_status()
    
    return response.json()


def verify_google_token(token):
    """
    Verify Google ID token and return user info
    """
    try:
        client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), client_id
        )
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return idinfo
    except ValueError:
        raise


# Email Invitation Setup Guide

## Overview

The application now supports sending email invitations to join teams via SMTP. This guide will help you configure the email settings.

## Environment Variables

Add the following variables to your `.env` file in the `Backend` directory:

```env
# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# Frontend URL (for invitation links)
FRONTEND_URL=http://localhost:3000
```

## Gmail Setup (Recommended for Development)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Django Project Management" as the name
4. Click "Generate"
5. Copy the 16-character password (use this as `EMAIL_HOST_PASSWORD`)

### Step 3: Update .env File

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-character app password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

## Other Email Providers

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@outlook.com
EMAIL_HOST_PASSWORD=your-password
```

### SendGrid

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
```

### Mailgun

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-mailgun-username
EMAIL_HOST_PASSWORD=your-mailgun-password
```

## Testing Email Configuration

You can test the email configuration by:

1. Starting the Django server
2. Using the invitation feature in the frontend
3. Checking the Django logs for email errors

## API Endpoints

### Send Invitation

```
POST /api/accounts/teams/<team_id>/invite/
Body: {
  "email": "user@example.com",
  "role": "member"  // or "admin", "owner", "developer"
}
```

### Accept Invitation

```
POST /api/accounts/invitations/accept/
Body: {
  "token": "invitation-token-from-email"
}
```

## Features

- ✅ Email invitations with secure tokens
- ✅ 7-day expiration for invitations
- ✅ HTML email templates
- ✅ Invitation status tracking (pending, accepted, expired, cancelled)
- ✅ Automatic team membership upon acceptance
- ✅ Support for inviting users who don't have accounts yet

## Troubleshooting

### Email not sending?

1. Check that all environment variables are set correctly
2. Verify SMTP credentials are correct
3. Check Django logs for error messages
4. For Gmail, ensure you're using an App Password, not your regular password

### Invitation link not working?

1. Ensure `FRONTEND_URL` is set correctly
2. Check that the token hasn't expired (7 days)
3. Verify the user is logged in with the correct email

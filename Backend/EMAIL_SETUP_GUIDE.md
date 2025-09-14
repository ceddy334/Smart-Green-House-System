# OTP Email Setup Guide

## Current Issue
Your OTP email sending is failing because Gmail requires an **App Password** instead of your regular Gmail password for SMTP authentication.

## Error Details
```
Error: Invalid login: 534-5.7.9 Application-specific password required
```

## Solution Steps

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the setup process if not already enabled

### Step 2: Generate App Password
1. After 2FA is enabled, go back to "Security"
2. Click "2-Step Verification"
3. Scroll down and click "App passwords"
4. Select "Mail" from the dropdown
5. Click "Generate"
6. Copy the 16-character app password (format: xxxx xxxx xxxx xxxx)

### Step 3: Update Your .env File
Replace the current password in your `.env` file:

```env
# Email Configuration
EMAIL_USER=xirced334@gmail.com
EMAIL_PASSWORD=your-16-character-app-password-here
```

### Step 4: Restart Your Server
```bash
npm start
```

## Alternative Email Providers

If you prefer not to use Gmail, you can use other providers:

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

## Testing Your Setup

After updating the credentials, test the OTP functionality:

1. Start your server: `npm start`
2. Make a POST request to `/api/otp/send` with:
```json
{
  "email": "test@example.com",
  "purpose": "email_verification"
}
```

## Troubleshooting

### Common Issues:
1. **"Invalid login"** - Use App Password, not regular password
2. **"Connection timeout"** - Check firewall/antivirus settings
3. **"Authentication failed"** - Verify email and app password are correct

### Security Notes:
- Never share your app password
- App passwords bypass 2FA, so keep them secure
- You can revoke app passwords anytime from Google Account settings

## Current Configuration Status
✅ Email service code updated with better error handling
✅ Environment variables configured
❌ Gmail App Password needed (replace current password)

## Next Steps
1. Generate Gmail App Password
2. Update EMAIL_PASSWORD in .env file
3. Restart server
4. Test OTP sending functionality

# OTP Email Setup Guide

This guide will help you configure email functionality for OTP (One-Time Password) verification in your SGHS application.

## 📧 Gmail Configuration

### Step 1: Enable 2-Factor Authentication
1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. In your Google Account settings, go to **Security** → **2-Step Verification**
2. Scroll down to **App passwords**
3. Select **Mail** as the app
4. Select **Other (Custom name)** as the device
5. Enter "SGHS OTP System" as the name
6. Click **Generate**
7. Copy the generated 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables
Update your `.env` file in the Backend directory:

```env
# Email Configuration for OTP
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important:** 
- Use your actual Gmail address for `EMAIL_USER`
- Use the 16-character App Password (not your regular Gmail password) for `EMAIL_PASSWORD`
- Remove spaces from the App Password when adding to .env

## 🚀 Testing the Setup

### 1. Start the Backend Server
```bash
cd Backend
node server.js
```

### 2. Test OTP Functionality
```bash
node script/test-otp.js
```

### 3. Test with Frontend
1. Start the frontend: `npm start` (in frontend directory)
2. Go to http://localhost:3000/register
3. Enter a valid email address
4. Check your email for the OTP code
5. Complete the registration process

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid login" error**
   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" error**
   - This is normal with App Passwords
   - Make sure you're using the correct App Password format

3. **Email not received**
   - Check spam/junk folder
   - Verify the email address is correct
   - Wait a few minutes for delivery

4. **"Authentication failed" error**
   - Double-check the App Password
   - Ensure there are no extra spaces in the .env file
   - Restart the server after updating .env

## 📱 OTP Features

### Supported Purposes:
- `email_verification` - For new user registration
- `password_reset` - For password reset requests
- `login_verification` - For additional login security

### Security Features:
- OTPs expire in 10 minutes
- Maximum 3 verification attempts per OTP
- Rate limiting: Max 3 OTPs per email per hour
- Auto-deletion of expired OTPs
- Secure 6-digit numeric codes

## 🎯 API Endpoints

### Send OTP
```
POST /api/otp/send
{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

### Verify OTP
```
POST /api/otp/verify
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "email_verification"
}
```

### Resend OTP
```
POST /api/otp/resend
{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

### Complete Registration with OTP
```
POST /api/otp/verify-and-register
{
  "email": "user@example.com",
  "otp": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123"
}
```

## 📧 Email Templates

The system includes beautiful HTML email templates for:
- Email verification
- Password reset
- Login verification
- Default verification

All templates are responsive and include security warnings.

## 🔒 Security Best Practices

1. **Never commit .env files** to version control
2. **Use App Passwords** instead of regular passwords
3. **Rotate App Passwords** regularly
4. **Monitor email delivery** and handle failures gracefully
5. **Implement rate limiting** (already included)
6. **Log OTP attempts** for security monitoring

## 📊 Monitoring

Check server logs for:
- Email sending success/failure
- OTP generation and verification
- Rate limiting triggers
- Security violations

## 🆘 Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify your Gmail configuration
3. Test with the provided test script
4. Ensure all environment variables are set correctly

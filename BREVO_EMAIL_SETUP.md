# Brevo Email Setup & Troubleshooting Guide

## Issue: "Fetch Failed" Error

### Root Causes
1. **Missing or Invalid BREVO_API_KEY** - Most common
2. **Network connectivity issue** - Can't reach Brevo servers
3. **.env file not loaded** - Environment variable not set
4. **SDK version incompatibility** - Fixed by using native fetch

## Solution Steps

### 1. Set Up Your Brevo API Key

1. Go to [Brevo Dashboard](https://app.brevo.com/settings/keys/api)
2. Generate or copy your API key
3. Create a `.env` file in the `backend/` directory:

```bash
BREVO_API_KEY=your_actual_api_key_here
EMAIL_FROM=noreply@yourname.com
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://localhost:27017/campusbite
NODE_ENV=development
```

### 2. Verify Configuration

Run this in your backend directory to test:

```bash
node -e "
require('dotenv').config({ path: '.env' });
console.log('BREVO_API_KEY configured:', !!process.env.BREVO_API_KEY ? '✓' : '✗');
console.log('BREVO_API_KEY length:', process.env.BREVO_API_KEY?.length || 0);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
"
```

### 3. Test Email Sending

Create a test script `test-email.js` in your backend:

```javascript
import dotenv from 'dotenv';
dotenv.config();

const testEmail = async () => {
  const apiKey = process.env.BREVO_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'no-reply@carthub.app';

  if (!apiKey) {
    console.error('❌ BREVO_API_KEY not configured');
    return;
  }

  console.log('Testing Brevo API...');
  console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  console.log('From:', emailFrom);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: emailFrom, name: 'CartHub' },
        to: [{ email: 'your-test-email@gmail.com', name: 'Test User' }],
        subject: 'Test Email from CartHub',
        htmlContent: '<p>This is a test email</p>',
        textContent: 'This is a test email',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✓ Email sent successfully');
      console.log('Message ID:', data.messageId);
    } else {
      const error = await response.json();
      console.error('❌ API Error:', response.status, error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
};

testEmail();
```

Run it with:
```bash
node test-email.js
```

### 4. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "BREVO_API_KEY is not configured" | Check .env file exists in `backend/` directory |
| "fetch failed" + network error | Check internet connection; Brevo servers might be down |
| API 401 Unauthorized | Your API key is invalid or expired |
| API 400 Bad Request | Email format is invalid or message structure is wrong |
| Email not received | Check spam folder; sender email might not be verified in Brevo |

### 5. Verify Sender Email in Brevo

1. Log in to [Brevo Dashboard](https://app.brevo.com/settings/senders)
2. Add and verify your sender email (e.g., noreply@yourname.com)
3. Use the verified email in your `.env` as `EMAIL_FROM`

### 6. Monitor Email Sending

The updated emailService.js now includes:
- ✓ Automatic retry logic (3 attempts with exponential backoff)
- ✓ Detailed logging for debugging
- ✓ Better error messages
- ✓ Native fetch (more reliable than SDK)

Watch backend logs for:
```
[Email] Attempt 1/3 - Sending email to user@gmail.com
[Email] Successfully sent to user@gmail.com: { messageId: '...' }
```

## Next Steps

1. **Copy `.env.example` to `.env`** and fill in your actual values
2. **Restart your backend server** after creating/updating `.env`
3. **Test with registration** - you should see detailed logs
4. **Check Brevo Dashboard** - emails should appear in Activity log

## Files Modified

- `backend/services/emailService.js` - Now uses native fetch with retry logic
- `backend/.env.example` - Template for configuration


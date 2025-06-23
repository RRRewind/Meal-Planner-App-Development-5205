# Google Authentication Setup Guide

## 🔧 Step 1: Configure Google OAuth in Supabase

### 1. Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Navigate to your project: `labsvtcxahdfzeqmnnyz`
3. Go to **Authentication** → **Providers**

### 2. Enable Google Provider
1. Find **Google** in the list of providers
2. Toggle it **ON** (Enable)
3. You'll need to configure Google OAuth credentials

## 🔑 Step 2: Create Google OAuth Application

### 1. Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**

### 2. Create OAuth 2.0 Client ID
1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Choose **Web application**
3. Name it: `Meal Planner App`

### 3. Configure Authorized URLs
**Authorized JavaScript origins:**
```
https://labsvtcxahdfzeqmnnyz.supabase.co
https://yourdomain.com
https://meals.yourdomain.com
http://localhost:5173
```

**Authorized redirect URIs:**
```
https://labsvtcxahdfzeqmnnyz.supabase.co/auth/v1/callback
https://yourdomain.com/auth/callback  
https://meals.yourdomain.com/auth/callback
http://localhost:5173/auth/callback
```

### 4. Get Your Credentials
- Copy **Client ID** 
- Copy **Client Secret**

## ⚙️ Step 3: Configure Supabase

### 1. Add Google Credentials to Supabase
1. Back in Supabase Dashboard
2. **Authentication** → **Providers** → **Google**
3. Paste **Client ID** 
4. Paste **Client Secret**
5. Click **Save**

### 2. Configure Site URL
1. Go to **Authentication** → **Settings**
2. Set **Site URL**: `https://meals.yourdomain.com`
3. Add **Additional Redirect URLs**:
   ```
   https://meals.yourdomain.com/**
   http://localhost:5173/**
   ```

## 🔒 Step 4: Update OAuth Consent Screen

### 1. Configure Consent Screen
1. In Google Cloud Console
2. **APIs & Services** → **OAuth consent screen**
3. Choose **External** (for public use)
4. Fill required fields:
   - **App name**: Meal Planner
   - **User support email**: your-email@domain.com
   - **Developer contact**: your-email@domain.com

### 2. Add Scopes
Add these scopes:
- `email`
- `profile` 
- `openid`

### 3. Add Test Users (if in testing mode)
- Add your email and test users

## 🧪 Step 5: Test Configuration

### 1. Local Testing
```bash
npm run dev
# Try Google sign-in at http://localhost:5173
```

### 2. Production Testing  
- Deploy to your subdomain
- Test Google authentication
- Check browser console for errors

## 🚨 Troubleshooting

### Error: "redirect_uri_mismatch"
**Fix:** Add exact redirect URI to Google Console:
```
https://labsvtcxahdfzeqmnnyz.supabase.co/auth/v1/callback
```

### Error: "Invalid client"
**Fix:** Double-check Client ID and Secret in Supabase

### Error: "Access blocked"
**Fix:** Publish OAuth consent screen or add user as tester

### Error: "Provider not enabled"
**Fix:** Ensure Google provider is toggled ON in Supabase

## ✅ Verification Checklist

- [ ] Google provider enabled in Supabase
- [ ] Google OAuth app created
- [ ] Client ID/Secret added to Supabase  
- [ ] Redirect URIs match exactly
- [ ] Site URL configured in Supabase
- [ ] OAuth consent screen configured
- [ ] Local testing works
- [ ] Production testing works

## 🔧 Alternative: Email-Only Authentication

If you prefer to disable Google auth temporarily:

```javascript
// In AuthModal.jsx, comment out Google sign-in button
{/* <motion.button
  onClick={handleGoogleSignIn}
  // ... Google sign-in code
>
  Continue with Google
</motion.button> */}
```
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

**⚠️ IMPORTANT: Use your actual deployed domain, not localhost**

**Authorized JavaScript origins:**
```
https://labsvtcxahdfzeqmnnyz.supabase.co
https://your-vercel-app.vercel.app
https://meals.yourdomain.com
```

**Authorized redirect URIs:**
```
https://labsvtcxahdfzeqmnnyz.supabase.co/auth/v1/callback
```

**❌ DO NOT ADD localhost URLs for production**

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
2. Set **Site URL**: `https://your-vercel-app.vercel.app` (or your custom domain)
3. Add **Additional Redirect URLs**:
```
https://your-vercel-app.vercel.app/**
https://meals.yourdomain.com/**
```

**⚠️ CRITICAL: Replace with your actual domain!**

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

## 🚨 Step 5: Fix Current Issue

### Immediate Fix:
1. **Go to Google Cloud Console**
2. **APIs & Services** → **Credentials**
3. **Edit your OAuth 2.0 Client ID**
4. **Remove ALL localhost URLs**
5. **Add your deployed domain URLs only**

### Example Configuration:
```
Authorized JavaScript origins:
✅ https://labsvtcxahdfzeqmnnyz.supabase.co
✅ https://your-vercel-app.vercel.app
✅ https://meals.yourdomain.com

Authorized redirect URIs:
✅ https://labsvtcxahdfzeqmnnyz.supabase.co/auth/v1/callback

❌ http://localhost:5173 (REMOVE THIS)
❌ http://localhost:5173/auth/callback (REMOVE THIS)
❌ http://localhost:3000 (REMOVE THIS)
```

## 🧪 Step 6: Test Configuration

### 1. Production Testing
- Go to your deployed app
- Try Google sign-in
- Should redirect properly now

### 2. Local Development
For local development, create a separate OAuth client:
1. Create another OAuth 2.0 Client ID
2. Name it: `Meal Planner App - Development`
3. Add localhost URLs to this one only
4. Use different credentials for local development

## 🔧 Step 7: Environment Variables

### Production Environment Variables:
```bash
REACT_APP_SUPABASE_URL=https://labsvtcxahdfzeqmnnyz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel Environment Variables:
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add the above variables

## ✅ Verification Checklist

- [ ] Google OAuth client configured with production URLs only
- [ ] Supabase Site URL matches your deployed domain
- [ ] No localhost URLs in production OAuth client
- [ ] OAuth consent screen configured
- [ ] Environment variables set in Vercel
- [ ] Test Google sign-in on deployed app

## 🚨 Troubleshooting

### Error: "redirect_uri_mismatch"
**Fix:** Make sure the redirect URI in Google Console exactly matches:
```
https://labsvtcxahdfzeqmnnyz.supabase.co/auth/v1/callback
```

### Error: "This site can't be reached localhost"
**Fix:** Remove all localhost URLs from Google OAuth client configuration

### Error: "Access blocked"
**Fix:** Publish OAuth consent screen or add user as tester

## 🔄 Quick Fix Steps:

1. **Google Cloud Console** → **Credentials**
2. **Edit OAuth Client**
3. **Remove localhost URLs**
4. **Save changes**
5. **Test again on deployed app**

The error should be resolved immediately after removing localhost URLs from your Google OAuth configuration.

## 🛠️ Additional Configuration for HashRouter

Since this app uses HashRouter, make sure your redirect URLs include the hash:

**Supabase Site URL:**
```
https://your-domain.com/#/
```

**Additional Redirect URLs:**
```
https://your-domain.com/#/**
```

This ensures proper routing after OAuth callback.
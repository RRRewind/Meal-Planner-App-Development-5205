# Meal Planner App - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Step 1: Prepare for Deployment
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the build locally
npm run preview
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository (or drag & drop the project folder)
4. Vercel will auto-detect it's a Vite project
5. Click "Deploy"

### Step 3: Configure Custom Domain
1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your subdomain: `meals.yourdomain.com`
4. Configure DNS as instructed by Vercel

## 🌐 Alternative Deployment Options

### Option A: Traditional Web Hosting (cPanel/FTP)
```bash
# Build the project
npm run build

# Upload the contents of 'dist' folder to your subdomain directory
# Example: /public_html/meals/ or /public_html/subdomains/meals/
```

### Option B: Netlify
1. Build: `npm run build`
2. Drag & drop `dist` folder to Netlify
3. Configure custom domain in Netlify settings

### Option C: GitHub Pages
1. Build: `npm run build`
2. Push `dist` folder to `gh-pages` branch
3. Enable GitHub Pages with custom domain

## 🔧 DNS Configuration

### For Subdomain Setup:
```
Type: CNAME
Name: meals (or your chosen subdomain)
Value: your-vercel-app.vercel.app (or hosting provider)
TTL: Auto/3600
```

## 🔐 Environment Variables

Make sure to set these in your hosting provider:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## 📱 Post-Deployment Checklist
- [ ] App loads correctly
- [ ] Authentication works
- [ ] Database connections work
- [ ] All routes function properly
- [ ] Mobile responsiveness
- [ ] SSL certificate active
# 🚀 Railway Deployment Tutorial (Web Interface Only)

**CPA System v2.1.0**  
**Version:** 3.0.0 | **Date:** 2026-04-18

> ✅ **No CLI Required!**  
> ✅ **100% Web-Based**  
> ✅ **Step-by-Step Guide**  
> ✅ **Railway Dashboard Only**

---

## 📋 Overview

This guide walks you through deploying CPA System to Railway **using only the web dashboard** - no terminal or CLI commands needed!

### What You'll Deploy:
1. **Backend API** (Node.js + Express)
2. **Frontend Dashboard** (Next.js)
3. **PostgreSQL Database** (Railway Managed)

---

## 🎯 Prerequisites

✅ **GitHub Account** (with repo: `sirwhy/Clieproxy`)  
✅ **Railway Account** (free tier available)  
✅ **OAuth Credentials** (Google/GitHub - optional)  
✅ **Stable Internet Connection**  

---

## 📱 Step-by-Step Guide

### **Step 1: Login to Railway**

1. Go to: **https://railway.app**
2. Click **"Log In"** (top right)
3. Sign in with:
   - GitHub account (recommended)
   - Or email

✅ **Result:** You're logged in to Railway Dashboard

---

### **Step 2: Create New Project**

1. Click **"+ New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Railway connects to GitHub
4. Find and select: **`sirwhy/Clieproxy`**
5. Click **"Deploy"**

**What Happens:**
- Railway clones your repository
- Auto-detects Node.js app
- Starts build process
- Backend service created

✅ **Result:** Backend service deployed (takes ~2-3 minutes)

---

### **Step 3: Add PostgreSQL Database**

1. In Railway Dashboard, click **"+ New"** button
2. Select **"PostgreSQL"** from list
3. Click **"Create"**
4. Wait for database to provision (~30 seconds)
5. **Click on the database** service card
6. Go to **"Variables"** tab
7. Copy the **`DATABASE_URL`** value (you'll need this!)

💡 **Tip:** Click the copy icon next to the value, or select all and copy manually.

✅ **Result:** PostgreSQL database ready

---

### **Step 4: Configure Backend Environment Variables**

1. Click on **Backend service** (should show "Deployed" or "Building")
2. Go to **"Variables"** tab
3. Click **"+ Add Variable"**
4. Add these variables one by one:

| Variable Name | Variable Value | Notes |
|---------------|----------------|-------|
| `DATABASE_URL` | Paste the URL from Step 3 | Required! |
| `JWT_SECRET` | `my-jwt-secret-123` | Can change later |
| `PORT` | `3000` | Backend port |
| `NODE_ENV` | `production` | Production mode |
| `ENCRYPTION_KEY` | `my-encryption-key-32chars` | For API key encryption |

**How to Add:**
1. Click "+ Add Variable"
2. Enter variable name
3. Enter variable value
4. Click "Add" (or press Enter)
5. Repeat for all variables

✅ **Result:** Backend configured with all variables

---

### **Step 5: Deploy Backend Again**

After adding variables, Railway auto-redeploys.

**To Verify:**
1. Click on Backend service
2. Go to **"Deployments"** tab
3. Check status shows **"Active"**
4. Click on latest deployment
5. See **"Deployments"** list
6. Latest should show **"Active"** ✅

---

### **Step 6: Add Frontend Service**

1. In Railway Dashboard, click **"+ New"**
2. Select **"Deploy from GitHub"**
3. Select same repo: **`sirwhy/Clieproxy`**
4. Railway creates frontend service
5. Wait for deployment (~2-3 minutes)

✅ **Result:** Frontend service deployed

---

### **Step 7: Configure Frontend Variables**

1. Click on **Frontend service**
2. Go to **"Variables"** tab
3. Click **"+ Add Variable"**

First, get the URLs:

**Get Backend URL:**
1. Go back to Backend service
2. Click on **"Settings"** tab
3. Look for **"Custom Domain"** or **"End Points"**
4. Copy the URL (looks like: `https://backend-production-xxxx.up.railway.app`)

**Get Frontend URL:**
1. Go to Frontend service
2. Click on **"Settings"** tab
3. Copy the URL (looks like: `https://frontend-production-xxxx.up.railway.app`)

Now add frontend variables:

| Variable Name | Variable Value | Notes |
|---------------|----------------|-------|
| `NEXT_PUBLIC_API_URL` | Paste Backend URL from above | e.g., `https://backend-production-xxxx.up.railway.app/api` |
| `NEXT_PUBLIC_BASE_URL` | Paste Frontend URL | e.g., `https://frontend-production-xxxx.up.railway.app` |
| `NODE_ENV` | `production` | Production mode |

✅ **Result:** Frontend configured

---

### **Step 8: Run Database Migrations**

Railway doesn't auto-run migrations. Do this manually:

**Method 1: Railway Shell (Recommended)**

1. Click on **Backend service**
2. Click **"Shell"** button (top right)
3. In terminal that opens, type:
   ```bash
   npx prisma migrate deploy
   ```
4. Press **Enter**
5. Wait for completion

**Method 2: Railway Command**

1. Click on **Backend service**
2. Click **"Settings"** tab
3. Scroll to **"Root Directory"** - should be empty
4. Scroll to **"Start Command"** - should be:
   ```
   npx prisma migrate deploy && node server.js
   ```
5. Click **"Save"**
6. Go back to **"Deployments"** tab
7. Click **"Restart"**

✅ **Result:** Database tables created

---

### **Step 9: Seed Pricing Data**

Still in the same Shell terminal from Step 8:

1. Type this command:
   ```bash
   node scripts/seed-cpa-pricing.js
   ```
2. Press **Enter**
3. Wait for completion (should see "Done!" message)

**Expected Output:**
```
🌱 Seeding CPA pricing for ALL LLM models...
✅ Created: grok-4.20-0309-reasoning
✅ Created: claude-3-5-sonnet-20241022
...
🎉 Done! Created: 35, Updated: 0

📊 Active Models:
   grok-4.20-0309-reasoning
   claude-3-5-sonnet-20241022
   ...
```

✅ **Result:** All 25+ LLM models configured

---

### **Step 10: Test Your Deployment**

**Test Backend API:**

1. Click on **Backend service**
2. Click on **"Settings"** tab
3. Find **"Custom Domain"** or **"End Points"**
4. Copy the URL (e.g., `https://backend-production-xxxx.up.railway.app`)
5. Add `/api/health` to the URL
6. Paste in browser: `https://backend-production-xxxx.up.railway.app/api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "app": "CPA System",
  "version": "1.0.0",
  "timestamp": "2026-04-18T00:00:00.000Z"
}
```

✅ **If you see this:** Backend is working!

**Test Pricing API:**

1. Add `/api/cpa/pricing` to backend URL
2. Paste in browser: `https://backend-production-xxxx.up.railway.app/api/cpa/pricing`

**Expected Response:**
```json
{
  "success": true,
  "pricing": [
    {
      "model": "grok-4.20-0309-reasoning",
      "pricePerTokenIn": 0.5,
      "pricePerTokenOut": 1.0
    },
    ...
  ]
}
```

✅ **If you see models:** Pricing is seeded correctly!

**Test Frontend:**

1. Click on **Frontend service**
2. Find **URL** in settings
3. Open in browser
4. Should see landing page

✅ **If you see dashboard:** Frontend is working!

---

## 📊 Summary of URLs

After deployment, you'll have:

| Service | How to Get URL | Example URL |
|---------|----------------|-------------|
| **Backend API** | Backend Settings → End Points | `https://backend-production-xxxx.up.railway.app` |
| **Frontend** | Frontend Settings → End Points | `https://frontend-production-xxxx.up.railway.app` |
| **Database** | Database Variables → DATABASE_URL | (internal only) |

---

## 🔐 Setup OAuth (Optional but Recommended)

### **Google OAuth:**

1. Go to: **https://console.cloud.google.com**
2. Create new project (or select existing)
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Application type: **"Web application"**
6. Name: `CPA System`
7. **Authorized redirect URIs:**
   ```
   https://your-backend-url.railway.app/api/auth/oauth/callback/google
   ```
   (Replace with your actual backend URL)
8. Click **"Create"**
9. Copy **Client ID** and **Client Secret**
10. Add to Railway Backend Variables:
    - `OAUTH_GOOGLE_CLIENT_ID` → Client ID
    - `OAUTH_GOOGLE_CLIENT_SECRET` → Client Secret

### **GitHub OAuth:**

1. Go to: **https://github.com/settings/developers**
2. Click **"New OAuth App"**
3. Application name: `CPA System`
4. Homepage URL: `https://your-frontend-url.railway.app`
5. Authorization callback URL:
   ```
   https://your-backend-url.railway.app/api/auth/oauth/callback/github
   ```
6. Click **"Register application"**
7. Copy **Client ID** and **Client Secret**
8. Add to Railway Backend Variables:
   - `OAUTH_GITHUB_CLIENT_ID` → Client ID
   - `OAUTH_GITHUB_CLIENT_SECRET` → Client Secret

✅ **Result:** OAuth ready to use!

---

## 🎨 Test Everything

### **Test 1: Backend API**
```
https://your-backend-url.railway.app/api/health
✅ Should show: {"status":"OK"}
```

### **Test 2: Pricing**
```
https://your-backend-url.railway.app/api/cpa/pricing
✅ Should show all 25+ LLM models
```

### **Test 3: Frontend**
```
https://your-frontend-url.railway.app
✅ Should show landing page
```

### **Test 4: Login**
```
https://your-frontend-url.railway.app/login
✅ Should show Google, GitHub, Twitter buttons
```

### **Test 5: Integrations**
```
1. Login first
2. Go to /integrations
✅ Should show Kilo Kiro, Antigravity, etc.
```

---

## 📝 Troubleshooting

### **Issue: Backend not deploying**
**Solution:**
1. Click Backend service
2. Go to **"Deployments"** tab
3. Click on failed deployment
4. Check **"Logs"** for errors
5. Common fix: Check DATABASE_URL is correct

### **Issue: Database connection failed**
**Solution:**
1. Check DATABASE_URL in Backend Variables
2. Make sure you copied it from Database service
3. Redeploy Backend service

### **Issue: Frontend can't reach backend**
**Solution:**
1. Check NEXT_PUBLIC_API_URL is correct
2. Make sure it ends with `/api`
3. Verify Backend service URL is correct

### **Issue: Migration failed**
**Solution:**
1. Run `npx prisma migrate deploy` in Railway Shell
2. Check Prisma schema is correct
3. Verify DATABASE_URL

### **Issue: Pricing not seeded**
**Solution:**
1. Run `node scripts/seed-cpa-pricing.js` in Railway Shell
2. Check for errors in output

---

## 💰 Railway Pricing

**Free Tier:**
- ✅ 5 projects
- ✅ $5 credit/month
- ⏰ Auto-sleep after inactivity

**Estimated Cost:**
- Backend: $2-5/month (when active)
- Frontend: $2-5/month (when active)
- Database: $0-5/month (depending on usage)

**Total:** ~$5-15/month for all 3 services

---

## 🎯 Quick Checklist

- [ ] Created Railway project from GitHub
- [ ] Added PostgreSQL database
- [ ] Copied DATABASE_URL
- [ ] Set Backend variables
- [ ] Backend deployed successfully
- [ ] Created Frontend service
- [ ] Set Frontend variables
- [ ] Frontend deployed successfully
- [ ] Ran database migrations
- [ ] Seeded pricing data
- [ ] Tested backend API
- [ ] Tested frontend
- [ ] (Optional) Set up OAuth credentials

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **Railway Dashboard:** https://railway.app/dashboard
- **CPA System Docs:** /docs in repository
- **GitHub:** https://github.com/sirwhy/Clieproxy

---

## 🎉 Success!

You should now have:

✅ **Backend API** deployed  
✅ **Frontend Dashboard** deployed  
✅ **PostgreSQL Database** configured  
✅ **OAuth ready** (if configured)  
✅ **25+ LLM models** seeded  
✅ **Fully functional** CPA System!  

---

**Happy deploying! 🚀**

**Version:** 3.0.0  
**Last Updated:** 2026-04-18  
**Platform:** Railway (Web Interface)

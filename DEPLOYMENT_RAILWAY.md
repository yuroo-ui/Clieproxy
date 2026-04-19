# 🚀 Railway Deployment Guide - CPA System

**Complete guide for deploying CPA System (Backend + Frontend) to Railway**

---

## 📋 Prerequisites

✅ GitHub account with `sirwhy/Clieproxy` repository  
✅ Railway account (free tier available)  
✅ PostgreSQL database (Railway provides free)  

---

## 🎯 Overview

### What You'll Deploy:
1. **Backend** - CPA System API (Node.js + Express)
2. **Frontend** - Next.js Dashboard (React + TypeScript)
3. **Database** - PostgreSQL (auto-provisioned by Railway)

### Architecture:
```
Frontend (Next.js)     Backend (Express)     Database (PostgreSQL)
     ↓                      ↓                      ↓
  Port 3001            Port 3000           Railway Managed
     ↓                      ↓                      ↓
  API Calls →        /api/cpa/*           UserWallet, LLMUsage, etc.
```

---

## 🚀 Step-by-Step Deployment

### **Step 1: Prepare Repository**

Make sure your repo is up to date:

```bash
cd /root/.openclaw/workspace/cpa-system
git add .
git commit -m "Add frontend and update configs"
git push origin main
```

**Repository:** https://github.com/sirwhy/Clieproxy

---

### **Step 2: Create Railway Project**

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose `sirwhy/Clieproxy`
5. Click **"Deploy"**

---

### **Step 3: Add PostgreSQL Database**

1. In Railway dashboard, click **"+ New"**
2. Select **"PostgreSQL"**
3. Wait for database to provision (takes ~30 seconds)
4. Click on database → **"Variables"** tab
5. **Copy the `DATABASE_URL`** (you'll need this!)

---

### **Step 4: Configure Backend (CPA System API)**

1. Go to your project
2. Find the **CPA System** service (backend)
3. Click on it → **"Variables"** tab
4. Add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Paste the URL from database (from Step 3) |
| `JWT_SECRET` | `my-secret-key-123` (or auto-generate) |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

5. **Save** and Railway will auto-redeploy

---

### **Step 5: Configure Frontend (Next.js)**

1. In Railway dashboard, click **"+ New"**
2. Select **"Deploy from GitHub repo"**
3. Choose `sirwhy/Clieproxy` again (same repo!)
4. This creates the frontend service

5. On frontend service:
   - Click **"Variables"** tab
   - Add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Get from backend service → **"Endpoints"** → Copy URL |
| `NEXT_PUBLIC_BASE_URL` | Get from frontend service → **"Endpoints"** |
| `NODE_ENV` | `production` |

---

### **Step 6: Configure Build & Start Commands**

#### Backend Settings:

1. Click backend service → **"Settings"**
2. **Root Directory:** Leave empty (or `cpa-system`)
3. **Build Command:** `npm install`
4. **Start Command:** `npx prisma migrate deploy && node server.js`

#### Frontend Settings:

1. Click frontend service → **"Settings"**
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm run start`

---

### **Step 7: Run Database Migrations**

After backend is deployed:

1. Click backend service → **"Shell"**
2. Run these commands:

```bash
# Prisma should already be configured
npx prisma migrate deploy

# Seed pricing data
node scripts/seed-cpa-pricing.js
```

---

### **Step 8: Test Your Deployment**

#### Backend API:
```bash
# From Railway → Backend → "Endpoints"
# Or copy the URL and test:

curl https://your-backend.railway.app/api/health

curl https://your-backend.railway.app/api/cpa/pricing
```

#### Frontend Dashboard:
```
Open: https://your-frontend.railway.app
```

---

## 📊 Configuration Summary

### Backend (CPA System API):

```yaml
Service: cpa-system-backend
Port: 3000
Build: npm install
Start: npx prisma migrate deploy && node server.js
Env:
  - DATABASE_URL: <from Railway PostgreSQL>
  - JWT_SECRET: your-secret-key
  - PORT: 3000
  - NODE_ENV: production
```

### Frontend (Next.js Dashboard):

```yaml
Service: cpa-system-frontend
Port: 3001
Build: npm install && npm run build
Start: npm run start
Env:
  - NEXT_PUBLIC_API_URL: https://your-backend.railway.app/api
  - NEXT_PUBLIC_BASE_URL: https://your-frontend.railway.app
```

### Database:

```yaml
Type: PostgreSQL 15
Size: Free tier (512MB)
Tables:
  - UserWallet
  - LLMUsage
  - LLMPriceConfig
  - TransactionHistory
```

---

## 🎨 Frontend Features

After deployment, you can access:

1. **Dashboard** - View balance, transactions
2. **Settings** - Add/manage LLM API keys
3. **Calculator** - Estimate LLM costs
4. **Usage History** - View usage analytics

**URL:** `https://your-frontend.railway.app`

---

## 📡 API Endpoints

All available at: `https://your-backend.railway.app/api/cpa/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/wallet` | GET | Get user balance |
| `/wallet/deposit` | PUT | Add funds |
| `/wallet/history` | GET | Transaction history |
| `/calculate` | POST | Estimate cost |
| `/charge` | POST | Charge usage |
| `/pricing` | GET | View all prices |

---

## 🔧 Troubleshooting

### Issue: Database connection failed
**Solution:**
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL service is running
- Verify network access in Railway

### Issue: Frontend can't reach backend
**Solution:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend URL (not localhost)
- Check CORS settings in backend

### Issue: Prisma migration failed
**Solution:**
```bash
# In Railway Shell
npx prisma generate
npx prisma migrate deploy
```

### Issue: Build failed
**Solution:**
- Check Node.js version (use 18.x)
- Review build logs for specific errors
- Ensure all dependencies are in package.json

---

## 💰 Railway Pricing

### Free Tier:
- ✅ 5 projects
- ✅ $5 credit/month
- ✅ Auto-sleep after inactivity

### Paid Plans:
- **Pro:** $5/month per service
- **Unlimited:** Custom pricing

**Estimated Cost for CPA System:**
- Backend: ~$2-5/month (active)
- Frontend: ~$2-5/month (active)
- Database: ~$0-5/month (depending on usage)

**Total:** ~$5-15/month for all 3 services

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected
- [ ] Environment variables set
- [ ] Prisma migrations run
- [ ] Pricing data seeded
- [ ] API endpoints tested
- [ ] Frontend dashboard accessible
- [ ] API keys can be added in frontend

---

## 🎉 Final URLs

After deployment, you'll have:

```
Frontend: https://your-frontend.railway.app
Backend:  https://your-backend.railway.app/api/cpa
Database: Railway PostgreSQL (auto-managed)
```

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **CPA System Docs:** /docs in repository
- **GitHub:** https://github.com/sirwhy/Clieproxy

---

**Happy deploying! 🚀**

---

**Quick Links:**
- [Railway Login](https://railway.app/login)
- [Create Project](https://railway.app/new-project)
- [Add Database](https://railway.app/new-database)

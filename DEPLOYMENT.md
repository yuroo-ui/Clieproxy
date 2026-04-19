# 🚀 CPA System - Deploy to Railway or Vercel

**Cost Per Action (CPA) System for All LLMs**  
**Version:** 1.0.0 | **Date:** 2026-04-17

---

## 📋 Quick Deploy Guide

### Option 1: Railway (Recommended)

**Railway** is perfect for PostgreSQL + Node.js apps!

#### Step 1: Push to GitHub

```bash
# Initialize git (if not done)
cd /root/.openclaw/workspace/cpa-system
git init
git add .
git commit -m "Initial CPA System commit"

# Add remote
git remote add origin https://github.com/sirwhy/Clieproxy.git

# Push
git push -u origin main
```

#### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `sirwhy/Clieproxy`
4. Railway will auto-detect Node.js app

#### Step 3: Add PostgreSQL

1. In Railway dashboard, click **"+ New"**
2. Select **"PostgreSQL"**
3. Wait for database to provision
4. Click on database → **"Variables"** tab
5. Copy `DATABASE_URL`

#### Step 4: Configure Environment Variables

In Railway dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Paste the URL from database variables |
| `JWT_SECRET` | Auto-generated (or set your own) |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

#### Step 5: Deploy!

Railway will auto-deploy when you push to GitHub.

Check logs:
```bash
railway logs
```

---

### Option 2: Vercel

**Vercel** is great for serverless deployment (no PostgreSQL included).

#### Setup Vercel Database:

1. Go to https://vercel.com
2. Create new project → Import from GitHub
3. Select `sirwhy/Clieproxy`

#### Add PostgreSQL:

1. Go to **Vercel Postgres** (Beta)
2. Create new database
3. Copy connection string

#### Configure Environment:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Vercel Postgres connection |
| `JWT_SECRET` | Random string |
| `PORT` | `3000` |

⚠️ **Note:** Vercel has function duration limits (10s for free, 60s for Pro). CPA System may need adjustment for long-running queries.

---

## 🔧 Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] DATABASE_URL configured
- [ ] JWT_SECRET set
- [ ] Prisma schema migrated
- [ ] Pricing data seeded

---

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Security
JWT_SECRET="your-secret-key-here"
PROXY_SECRET="your-proxy-secret"

# App
PORT=3000
NODE_ENV=production

# Optional
XAI_API_KEY="your-xai-key"
OPENAI_API_KEY="your-openai-key"
AKASH_API_KEY="your-akash-key"
```

---

## 🚀 Post-Deployment Setup

### 1. Run Database Migrations

```bash
railway variable get DATABASE_URL > .env
npx prisma migrate deploy
```

### 2. Seed Pricing Data

```bash
node scripts/seed-cpa-pricing.js
```

### 3. Test API

```bash
curl https://your-app.railway.app/api/health

curl https://your-app.railway.app/api/cpa/pricing
```

---

## 💡 Railway Tips

### View Logs
```bash
railway logs
railway logs -f  # Follow logs
```

### Open Shell
```bash
railway shell
```

### Restart Service
```bash
railway restart
```

### View Variables
```bash
railway variable ls
railway variable get DATABASE_URL
```

---

## 💡 Vercel Tips

### Deploy
```bash
vercel deploy --prod
```

### View Logs
```bash
vercel logs
```

### Environment Variables
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

---

## 📊 Database Schema

Railway/Vercel will use this schema:

```prisma
model UserWallet {
  id        String   @id @default(cuid())
  userId    String   @unique
  balance   Float    @default(0)
  currency  String   @default("USD")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model LLMUsage {
  id        String   @id @default(cuid())
  userId    String
  model     String
  tokensIn  Int      @default(0)
  tokensOut Int      @default(0)
  cost      Float    @default(0)
  createdAt DateTime @default(now())
}

model LLMPriceConfig {
  id               String   @id @default(cuid())
  modelName        String   @unique
  pricePerTokenIn  Float    @default(0.001)
  pricePerTokenOut Float    @default(0.002)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model TransactionHistory {
  id            String   @id @default(cuid())
  userId        String
  amount        Float
  type          String
  currency      String   @default("USD")
  status        String   @default("COMPLETED")
  paymentMethod String
  createdAt     DateTime @default(now())
}
```

---

## 🔍 Troubleshooting

### Issue: "Database connection failed"
**Solution:** 
- Check DATABASE_URL is correct
- Ensure Railway/Vercel can reach database
- Check firewall/network settings

### Issue: "Prisma not found"
**Solution:**
```bash
npm install prisma @prisma/client
npx prisma generate
```

### Issue: "Port already in use"
**Solution:**
- Railway uses PORT env variable automatically
- Vercel doesn't need PORT setting

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **CPA System Docs:** `/docs/` in repository

---

## 🎯 Quick Deploy Command

```bash
# 1. Push to GitHub
git push origin main

# 2. Railway will auto-deploy
# OR manually:
railway up

# 3. Open dashboard
railway open
```

---

**Ready to deploy! 🚀**

**Repo:** https://github.com/sirwhy/Clieproxy  
**Last Updated:** 2026-04-17

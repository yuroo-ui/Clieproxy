# 🚀 CPA System - Cost Per Action for All LLMs

**Universal billing system for tracking & monetizing LLM usage**  
**Version:** 1.0.0 | **Date:** 2026-04-17

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/template/Clieproxy)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sirwhy/Clieproxy)

---

## 🎯 What is CPA System?

A **complete billing system** for tracking LLM usage across ANY platform:

- ✅ **User Wallets** - Balance, deposits, transactions
- ✅ **25+ LLM Models** - Grok, Claude, Qwen, DeepSeek, Llama, GPT, Gemini, Mistral
- ✅ **Usage Tracking** - Token counting, cost calculation
- ✅ **Admin Dashboard** - Manage users, pricing, revenue
- ✅ **Middleware** - Balance checks before LLM calls

---

## 💰 Pricing Examples (per 1K tokens)

| Model | Input | Output |
|-------|-------|--------|
| **Grok-4** | $0.50 | $1.00 |
| **Claude-3.5-Sonnet** | $3.00 | $15.00 |
| **Qwen-35B** | $0.30 | $0.60 |
| **DeepSeek-Chat** | $0.14 | $0.28 |
| **GPT-4o** | $2.50 | $10.00 |

**Cost Formula:** `(tokensIn × priceIn + tokensOut × priceOut) / 1000`

---

## 🚀 Quick Deploy

### Option 1: Railway (Recommended)

```bash
# 1. Click button below
[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/template/Clieproxy)

# 2. Add PostgreSQL database
# 3. Set DATABASE_URL
# 4. Done!
```

### Option 2: Vercel

```bash
# 1. Click button below
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sirwhy/Clieproxy)

# 2. Add Vercel Postgres
# 3. Set DATABASE_URL
# 4. Deploy!
```

### Option 3: Manual Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step guide.

---

## 📋 Features

### User Wallet Management
- Check balance: `GET /api/cpa/wallet`
- Deposit funds: `PUT /api/cpa/wallet/deposit`
- Transaction history: `GET /api/cpa/wallet/history`

### LLM Usage Tracking
- Calculate cost: `POST /api/cpa/calculate`
- Charge usage: `POST /api/cpa/charge`
- Usage stats: `GET /api/cpa/usage/stats`

### Pricing Management
- View prices: `GET /api/cpa/pricing`
- Update pricing: `PUT /api/cpa/pricing` (admin)

### Admin Dashboard
- All users: `GET /api/admin/cpa/users`
- Revenue reports: `GET /api/admin/cpa/reports`
- Adjust balance: `PUT /api/admin/cpa/adjust`

---

## 🔧 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cpa/wallet` | ✅ | Get wallet balance |
| PUT | `/api/cpa/wallet/deposit` | ✅ | Add funds |
| GET | `/api/cpa/wallet/history` | ✅ | Transaction history |
| POST | `/api/cpa/calculate` | - | Estimate cost |
| POST | `/api/cpa/charge` | ✅ | Charge for usage |
| GET | `/api/cpa/usage/stats` | ✅ | Usage statistics |
| GET | `/api/cpa/pricing` | - | View all prices |
| PUT | `/api/cpa/pricing` | admin | Update pricing |
| GET | `/api/admin/cpa/users` | admin | All users |
| GET | `/api/admin/cpa/reports` | admin | Revenue reports |

---

## 🧪 Test API

```bash
# Get wallet balance
curl http://localhost:3000/api/cpa/wallet

# Deposit $10
curl -X PUT http://localhost:3000/api/cpa/wallet/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "currency": "USD"}'

# Calculate cost
curl -X POST http://localhost:3000/api/cpa/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.20-0309-reasoning",
    "tokensIn": 1000,
    "tokensOut": 500
  }'

# Get pricing
curl http://localhost:3000/api/cpa/pricing
```

---

## 📁 Database Schema

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
  type          String   // DEPOSIT, WITHDRAW, CHARGE
  currency      String
  status        String
  paymentMethod String
  createdAt     DateTime @default(now())
}
```

---

## 🔐 Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-jwt-secret-key"
PORT=3000
NODE_ENV=production
```

---

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [QUICK_START.md](./QUICK_START.md) - Quick reference
- [CPA_SYSTEM.md](./CPA_SYSTEM.md) - Complete documentation
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Integration guide

---

## 💡 Use Cases

### 1. Manga Scanner (OCR)
- Charge per page analyzed
- Track OCR + LLM tokens
- Estimated cost: $0.10-$0.50/page

### 2. AI Chatbot
- Charge per message
- Track context length
- Estimated cost: $0.05-$0.20/message

### 3. Content Generation
- Charge per article/video
- Track prompt + completion
- Estimated cost: $0.50-$5.00/generation

### 4. Code Assistant
- Charge per code analysis
- Track file size → tokens
- Estimated cost: $0.20-$2.00/analysis

---

## 🛠️ Installation

### Quick Start

```bash
# Clone repo
git clone https://github.com/sirwhy/Clieproxy.git
cd Clieproxy

# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db push

# Seed pricing
node scripts/seed-cpa-pricing.js

# Start server
npm start
```

---

## 🎯 25+ LLM Models Pre-configured

| Provider | Models | Price Range |
|----------|--------|-------------|
| **xAI** | Grok-4, Grok-beta | $0.50-$1.00 |
| **Anthropic** | Claude-3.5-Sonnet, Haiku, Opus | $0.80-$75.00 |
| **Akash/Qwen** | Qwen-35B, Qwen-235B | $0.25-$1.20 |
| **DeepSeek** | Chat, Coder | $0.14-$0.28 |
| **Llama** | 70B, 8B | $0.08-$0.80 |
| **OpenAI** | GPT-4o, GPT-4-turbo | $2.50-$30.00 |
| **Google** | Gemini-Pro, Flash | $0.075-$5.00 |
| **Mistral** | Large, Medium | $0.80-$6.00 |

---

## 🔧 Middleware Protection

```javascript
const { checkCPABalance } = require('./middleware/cpaCheck');

// Protect LLM endpoints
app.post('/api/llm/call', 
  authMiddleware,
  checkCPABalance,  // ✅ Check balance first
  llmHandler
);
```

---

## 📊 Monitoring

### Railway Logs

```bash
railway logs
railway logs -f  # Follow
```

### PM2 Logs

```bash
pm2 logs cpa-system
```

### Database

```sql
-- Check balances
SELECT * FROM "UserWallet";

-- Check usage
SELECT * FROM "LLMUsage" ORDER BY "createdAt" DESC LIMIT 10;

-- Check pricing
SELECT * FROM "LLMPriceConfig";
```

---

## 🚀 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] DATABASE_URL configured
- [ ] JWT_SECRET set
- [ ] PostgreSQL database connected
- [ ] Prisma migrations run
- [ ] Pricing data seeded
- [ ] API tested
- [ ] Deployed!

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## 📝 License

MIT License - feel free to use for personal or commercial projects!

---

## 🎉 Quick Links

- **Repo:** https://github.com/sirwhy/Clieproxy
- **Deploy to Railway:** [![Deploy](https://railway.app/button.svg)](https://railway.app/template/Clieproxy)
- **Deploy to Vercel:** [![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sirwhy/Clieproxy)

---

**Ready to deploy! 🚀**

**Made with ❤️ for all LLM developers!**

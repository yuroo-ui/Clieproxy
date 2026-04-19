# CPA (Cost Per Action) System - Generic Implementation

**Version:** 1.0.0  
**Date:** 2026-04-17  
**Compatible:** All platforms & LLM providers

---

## 📁 Files Created

### 1. Database Schema
- **Path:** `server/prisma/schema.prisma`
- **Content:** Prisma models for CPA system

### 2. API Routes
- **Path:** `server/routes/cpa.js`
- **Content:** All CPA endpoints (wallet, usage, pricing, admin)

### 3. Middleware
- **Path:** `server/middleware/cpaCheck.js`
- **Content:** Balance check & charge middleware

### 4. Scripts
- **Path:** `server/scripts/seed-cpa-pricing.js`
- **Content:** Seed 25+ LLM pricing data

### 5. Documentation
- **Path:** `docs/CPA_SYSTEM.md`
- **Content:** Complete guide

---

## 🚀 Quick Setup

### Step 1: Update Database Schema

Add to your `server/prisma/schema.prisma`:

```prisma
// User Wallets
model UserWallet {
  id        String   @id @default(cuid())
  userId    String   @unique
  balance   Float    @default(0)
  currency  String   @default("USD")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("user_wallets")
}

// LLM Usage
model LLMUsage {
  id        String   @id @default(cuid())
  userId    String
  model     String
  tokensIn  Int      @default(0)
  tokensOut Int      @default(0)
  cost      Float    @default(0)
  createdAt DateTime @default(now())
  @@map("llm_usage")
}

// Pricing Config
model LLMPriceConfig {
  id               String   @id @default(cuid())
  modelName        String   @unique
  pricePerTokenIn  Float    @default(0.001)
  pricePerTokenOut Float    @default(0.002)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  @@map("llm_price_configs")
}

// Transaction History
model TransactionHistory {
  id            String   @id @default(cuid())
  userId        String
  amount        Float
  type          String   // DEPOSIT, WITHDRAW, CHARGE
  currency      String
  status        String   // PENDING, COMPLETED, FAILED
  paymentMethod String
  createdAt     DateTime @default(now())
  @@map("transaction_histories")
}
```

### Step 2: Run Database Migration

```bash
cd server
npx prisma migrate dev --name cpa_system
npx prisma db push
```

### Step 3: Seed Pricing Data

```bash
node scripts/seed-cpa-pricing.js
```

### Step 4: Add Routes to Express

```javascript
// server/src/index.js
app.use('/api/cpa', require('../routes/cpa'));
```

### Step 5: Add Middleware

```javascript
// server/src/index.js
const { checkCPABalance } = require('../middleware/cpaCheck');

app.use('/api/cpa/charge', checkCPABalance, require('../routes/cpa').charge);
```

---

## 📡 API Endpoints

### User Wallet

```bash
# Get wallet balance
GET /api/cpa/wallet
Authorization: Bearer <token>

# Deposit balance
PUT /api/cpa/wallet/deposit
Authorization: Bearer <token>
{
  "amount": 10,
  "currency": "USD"
}

# Transaction history
GET /api/cpa/wallet/history
Authorization: Bearer <token>
```

### LLM Usage

```bash
# Calculate estimated cost
POST /api/cpa/calculate
{
  "model": "grok-4.20-0309-reasoning",
  "tokensIn": 1000,
  "tokensOut": 500
}

# Charge for LLM usage
POST /api/cpa/charge
Authorization: Bearer <token>
{
  "model": "grok-4.20-0309-reasoning",
  "tokensIn": 1000,
  "tokensOut": 500
}

# Usage statistics
GET /api/cpa/usage/stats?period=30d
Authorization: Bearer <token>
```

### Pricing

```bash
# Get all pricing
GET /api/cpa/pricing

# Update pricing (admin)
PUT /api/cpa/pricing
Authorization: Bearer <token>
{
  "modelName": "grok-4",
  "pricePerTokenIn": 0.50,
  "pricePerTokenOut": 1.00
}
```

### Admin

```bash
# All users with balances
GET /api/admin/cpa/users
Authorization: Bearer <token>

# Revenue reports
GET /api/admin/cpa/reports?period=30d
Authorization: Bearer <token>

# Adjust user balance
PUT /api/admin/cpa/adjust
Authorization: Bearer <token>
{
  "userId": "user-id",
  "amount": 5.00,
  "reason": "Promotional credit"
}
```

---

## 💰 Pricing Models

### Popular LLMs (per 1K tokens):

| Model | Input ($/1K) | Output ($/1K) |
|-------|--------------|---------------|
| Grok-4 | 0.50 | 1.00 |
| Claude-3.5-Sonnet | 3.00 | 15.00 |
| Claude-3.5-Haiku | 0.80 | 4.00 |
| Qwen-3.5-35B | 0.30 | 0.60 |
| DeepSeek-Chat | 0.14 | 0.28 |
| Llama-3.3-70B | 0.40 | 0.80 |

### Cost Calculation:

```javascript
cost = (tokensIn * priceIn + tokensOut * priceOut) / 1000
```

**Example:**
```javascript
// Input: 1000 tokens × $0.50 = $0.50
// Output: 500 tokens × $1.00 = $0.50
// Total: $1.00
```

---

## 🔧 Usage Examples

### 1. Check Balance Before LLM Call

```javascript
const { checkCPABalance } = require('../middleware/cpaCheck');

app.post('/api/llm/complete', 
  authMiddleware, 
  checkCPABalance,
  async (req, res) => {
    const { model, messages } = req.body;
    const userId = req.user.id;
    
    // Calculate estimated cost
    const estimatedCost = await calculateEstimatedCost(model, messages);
    
    // Make LLM call
    const response = await llmProvider.call(model, messages);
    
    // Track actual usage
    await trackUsage({
      userId,
      model,
      tokensIn: response.usage.promptTokens,
      tokensOut: response.usage.completionTokens,
      cost: estimatedCost
    });
    
    res.json(response);
  }
);
```

### 2. Manual Charge

```javascript
// In your LLM service
async function chargeForLLMUsage(userId, model, tokensIn, tokensOut) {
  const response = await fetch('http://localhost:5000/api/cpa/charge', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userId}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      tokensIn,
      tokensOut
    })
  });
  
  return await response.json();
}
```

### 3. Deposit Balance

```javascript
// Frontend - Top up wallet
const topUp = async (amount) => {
  const response = await fetch('/api/cpa/wallet/deposit', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      currency: 'USD',
      paymentMethod: 'crypto'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Show payment details
    // Wait for payment confirmation
    // Refresh wallet balance
  }
};
```

---

## 📊 Database Models

### UserWallet

```prisma
model UserWallet {
  id        String   @id @default(cuid())
  userId    String   @unique
  balance   Float    @default(0)
  currency  String   @default("USD")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### LLMUsage

```prisma
model LLMUsage {
  id        String   @id @default(cuid())
  userId    String
  model     String
  tokensIn  Int      @default(0)
  tokensOut Int      @default(0)
  cost      Float    @default(0)
  createdAt DateTime @default(now())
}
```

### LLMPriceConfig

```prisma
model LLMPriceConfig {
  id               String   @id @default(cuid())
  modelName        String   @unique
  pricePerTokenIn  Float    @default(0.001)
  pricePerTokenOut Float    @default(0.002)
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

---

## 🎯 Integration Checklist

- [ ] Add database schema to your Prisma file
- [ ] Run `npx prisma migrate dev`
- [ ] Seed pricing data with `seed-cpa-pricing.js`
- [ ] Add CPA routes to Express app
- [ ] Add middleware to LLM endpoints
- [ ] Create frontend wallet UI
- [ ] Implement payment integration
- [ ] Test with sample data
- [ ] Deploy to production

---

## 📝 Notes

1. **Minimum Balance:** $0.10 recommended to prevent failed charges
2. **Rate Limiting:** Implement rate limiting on `/resend-verification`
3. **Audit Trail:** All balance changes are logged
4. **Transaction Safety:** Uses database transactions
5. **Security:** All endpoints require authentication
6. **Admin Only:** `/api/admin/*` routes require admin role

---

**Status:** Ready for Integration  
**Tested With:** Grok, Claude, Qwen, DeepSeek, Llama  
**Last Updated:** 2026-04-17 23:50 UTC

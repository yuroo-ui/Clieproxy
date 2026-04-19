/**
 * CPA (Cost Per Action) System - API Routes
 */
const router = require('express').Router();
const prisma  = require('../lib/prisma');
const { authMiddleware, adminMiddleware } = require('../lib/auth');

// ─── Wallet ───────────────────────────────────────────────────────────────────
router.get('/wallet', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let wallet = await prisma.userWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.userWallet.create({ data: { userId, balance: 0, currency: 'USD' } });
    }
    res.json({ success: true, wallet: { id: wallet.id, balance: parseFloat(wallet.balance.toFixed(4)), currency: wallet.currency, status: wallet.status } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/wallet/deposit', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, currency, paymentMethod } = req.body;
    if (!amount || parseFloat(amount) <= 0) return res.status(400).json({ error: 'Amount tidak valid' });

    const deposit = await prisma.transactionHistory.create({
      data: { userId, amount: parseFloat(amount), currency: currency || 'USD', status: 'COMPLETED', type: 'DEPOSIT', paymentMethod: paymentMethod || 'manual' },
    });

    let wallet = await prisma.userWallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await prisma.userWallet.create({ data: { userId, balance: parseFloat(amount), currency: currency || 'USD' } });
    } else {
      wallet = await prisma.userWallet.update({ where: { userId }, data: { balance: { increment: parseFloat(amount) } } });
    }

    res.json({ success: true, message: 'Deposit berhasil', deposit, wallet: { balance: parseFloat(wallet.balance.toFixed(4)), currency: wallet.currency } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/wallet/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [deposits, llmUsage] = await Promise.all([
      prisma.transactionHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      // FIX: Correct Prisma model name is lLMUsage (based on @@map("llm_usage"))
      prisma.lLMUsage.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    res.json({ success: true, transactions: { deposits, llmUsage } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Cost Calculation ─────────────────────────────────────────────────────────
router.post('/calculate', authMiddleware, async (req, res) => {
  try {
    const { model, tokensIn, tokensOut } = req.body;
    if (!model || tokensIn == null || tokensOut == null)
      return res.status(400).json({ error: 'model, tokensIn, tokensOut wajib diisi' });

    // FIX: Correct model name is lLMPriceConfig
    const pricing = await prisma.lLMPriceConfig.findFirst({ where: { modelName: model, isActive: true } });
    if (!pricing) return res.status(404).json({ error: `Pricing untuk model "${model}" tidak ditemukan` });

    const cost = ((tokensIn * pricing.pricePerTokenIn) + (tokensOut * pricing.pricePerTokenOut)) / 1000;
    res.json({ success: true, model, tokensIn, tokensOut, estimatedCost: parseFloat(cost.toFixed(6)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/charge', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { model, tokensIn, tokensOut } = req.body;
    if (!model || tokensIn == null || tokensOut == null)
      return res.status(400).json({ error: 'model, tokensIn, tokensOut wajib diisi' });

    const pricing = await prisma.lLMPriceConfig.findFirst({ where: { modelName: model, isActive: true } });
    if (!pricing) return res.status(404).json({ error: `Pricing untuk model "${model}" tidak ditemukan` });

    const cost = ((tokensIn * pricing.pricePerTokenIn) + (tokensOut * pricing.pricePerTokenOut)) / 1000;
    const wallet = await prisma.userWallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < cost)
      return res.status(403).json({ error: 'Saldo tidak cukup', currentBalance: parseFloat((wallet?.balance || 0).toFixed(4)), requiredAmount: parseFloat(cost.toFixed(6)) });

    // FIX: field name is 'cost' not 'totalCost'
    const usage = await prisma.lLMUsage.create({
      data: { userId, model, tokensIn: parseInt(tokensIn), tokensOut: parseInt(tokensOut), cost: parseFloat(cost.toFixed(6)) },
    });
    await prisma.userWallet.update({ where: { userId }, data: { balance: { decrement: cost } } });

    res.json({ success: true, usage: { id: usage.id, model: usage.model, cost: parseFloat(usage.cost.toFixed(6)) }, remainingBalance: parseFloat((wallet.balance - cost).toFixed(4)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/usage/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;
    const dateFilter = new Date();
    if (period === '7d') dateFilter.setDate(dateFilter.getDate() - 7);
    else dateFilter.setDate(dateFilter.getDate() - 30);

    const stats = await prisma.lLMUsage.groupBy({
      by: ['model'],
      where: { userId, createdAt: { gte: dateFilter } },
      _sum: { cost: true, tokensIn: true, tokensOut: true },
      _count: { id: true },
    });

    const totalCost   = stats.reduce((s, x) => s + (x._sum.cost || 0), 0);
    const totalTokens = stats.reduce((s, x) => s + (x._sum.tokensIn || 0) + (x._sum.tokensOut || 0), 0);

    res.json({ success: true, stats: { period, totalCost: parseFloat(totalCost.toFixed(4)), totalTokens, byModel: stats.map(s => ({ model: s.model, count: s._count.id, cost: parseFloat((s._sum.cost || 0).toFixed(4)) })) } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Pricing ──────────────────────────────────────────────────────────────────
router.get('/pricing', async (req, res) => {
  try {
    const pricing = await prisma.lLMPriceConfig.findMany({ where: { isActive: true }, orderBy: { modelName: 'asc' } });
    res.json({ success: true, pricing: pricing.map(p => ({ model: p.modelName, provider: p.provider, pricePerTokenIn: p.pricePerTokenIn, pricePerTokenOut: p.pricePerTokenOut })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/pricing', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { modelName, provider, pricePerTokenIn, pricePerTokenOut } = req.body;
    if (!modelName) return res.status(400).json({ error: 'modelName wajib diisi' });
    const updated = await prisma.lLMPriceConfig.upsert({
      where: { modelName },
      update: { pricePerTokenIn: pricePerTokenIn ?? 0.001, pricePerTokenOut: pricePerTokenOut ?? 0.002, provider: provider || 'direct' },
      create: { modelName, provider: provider || 'direct', pricePerTokenIn: pricePerTokenIn ?? 0.001, pricePerTokenOut: pricePerTokenOut ?? 0.002 },
    });
    res.json({ success: true, pricing: { model: updated.modelName, pricePerTokenIn: updated.pricePerTokenIn, pricePerTokenOut: updated.pricePerTokenOut } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const wallets = await prisma.userWallet.findMany({
      include: { user: { select: { id: true, email: true, username: true, role: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, users: wallets.map(w => ({ userId: w.userId, email: w.user.email, username: w.user.username, balance: parseFloat(w.balance.toFixed(4)), currency: w.currency, status: w.status })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/admin/reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const dateFilter = new Date();
    if (period === '7d') dateFilter.setDate(dateFilter.getDate() - 7);
    else dateFilter.setDate(dateFilter.getDate() - 30);

    const [totalDeposits, totalUsage] = await Promise.all([
      prisma.transactionHistory.aggregate({ where: { status: 'COMPLETED', type: 'DEPOSIT', createdAt: { gte: dateFilter } }, _sum: { amount: true } }),
      prisma.lLMUsage.aggregate({ where: { createdAt: { gte: dateFilter } }, _sum: { cost: true } }),
    ]);

    const deposits = totalDeposits._sum.amount || 0;
    const usage    = totalUsage._sum.cost || 0;
    // FIX: Original had broken parenthesis in calculation
    res.json({ success: true, period, revenue: { totalDeposits: parseFloat(deposits.toFixed(2)), totalUsage: parseFloat(usage.toFixed(2)), netRevenue: parseFloat((deposits - usage).toFixed(2)) } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin: Adjust user balance manually
router.post('/admin/adjust-balance', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || amount == null) return res.status(400).json({ error: 'userId dan amount wajib' });
    const wallet = await prisma.userWallet.upsert({
      where: { userId },
      update: { balance: { increment: parseFloat(amount) } },
      create: { userId, balance: parseFloat(amount), currency: 'USD' },
    });
    await prisma.transactionHistory.create({
      data: { userId, amount: Math.abs(parseFloat(amount)), type: parseFloat(amount) > 0 ? 'DEPOSIT' : 'WITHDRAW', status: 'COMPLETED', paymentMethod: 'admin_adjust', metadata: JSON.stringify({ reason: reason || 'Admin adjustment' }) },
    });
    res.json({ success: true, newBalance: parseFloat(wallet.balance.toFixed(4)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

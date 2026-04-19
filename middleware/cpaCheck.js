/**
 * CPA Balance Check Middleware
 * Generic - works with any Express.js backend
 */

const prisma = require('../lib/prisma');

/**
 * Check if user has sufficient CPA balance
 * Usage: app.post('/api/llm/call', authMiddleware, checkCPABalance, llmHandler);
 */
exports.checkCPABalance = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - Login required' });
    }

    const wallet = await prisma.userWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      // Auto-create wallet with zero balance
      await prisma.userWallet.create({
        data: { userId, balance: 0, currency: 'USD' }
      });
      
      return res.status(403).json({ 
        error: 'Wallet not found',
        message: 'Please top up your wallet to continue',
        canCreate: true
      });
    }

    // Check minimum balance (e.g., $0.10 minimum)
    const MIN_BALANCE = 0.10;
    if (wallet.balance < MIN_BALANCE) {
      return res.status(403).json({ 
        error: 'Insufficient balance',
        currentBalance: parseFloat(wallet.balance.toFixed(4)),
        requiredAmount: MIN_BALANCE,
        message: 'Please top up your wallet to continue using LLM features'
      });
    }

    // Attach wallet to request
    req.wallet = {
      id: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency
    };

    next();
  } catch (error) {
    console.error('CPA balance check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Check specific minimum balance
 * Usage: app.post('/api/llm/heavy', checkCPAMinimum(1.00));
 */
exports.checkCPAMinimum = (minimum) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const wallet = await prisma.userWallet.findUnique({
        where: { userId }
      });

      if (!wallet || wallet.balance < minimum) {
        return res.status(403).json({ 
          error: 'Insufficient balance',
          currentBalance: parseFloat(wallet?.balance?.toFixed(4) || 0),
          requiredAmount: parseFloat(minimum.toFixed(2)),
          message: 'Please top up your wallet to continue'
        });
      }

      req.wallet = wallet;
      next();
    } catch (error) {
      console.error('CPA minimum check error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Pre-charge balance for estimated usage
 * Reserve balance before LLM call completes
 */
exports.preChargeCPA = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { estimatedTokensIn = 1000, estimatedTokensOut = 500, model } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get pricing
    const pricing = await prisma.llmPriceConfig.findUnique({
      where: { modelName: model }
    });

    if (!pricing) {
      return res.status(404).json({ error: 'Model pricing not found' });
    }

    // Calculate estimated cost
    const estimatedCost = ((estimatedTokensIn * pricing.pricePerTokenIn) + 
                          (estimatedTokensOut * pricing.pricePerTokenOut)) / 1000;

    // Get current wallet
    const wallet = await prisma.userWallet.findUnique({
      where: { userId }
    });

    if (!wallet || wallet.balance < estimatedCost) {
      return res.status(403).json({ 
        error: 'Insufficient balance',
        currentBalance: parseFloat(wallet?.balance?.toFixed(4) || 0),
        estimatedCost: parseFloat(estimatedCost.toFixed(4)),
        message: 'Please top up your wallet to continue'
      });
    }

    // Store for later deduction
    req.estimatedCost = estimatedCost;
    req.estimatedTokensIn = estimatedTokensIn;
    req.estimatedTokensOut = estimatedTokensOut;
    req.cpaModel = model;

    next();
  } catch (error) {
    console.error('Pre-charge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Finalize CPA charge with actual token counts
 * Call after LLM call completes
 */
exports.finalizeCPACharge = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { tokensIn, tokensOut, model } = req.body;

    if (!userId || !model || !tokensIn || !tokensOut) {
      return next(); // Skip if not provided
    }

    // Get pricing
    const pricing = await prisma.llmPriceConfig.findUnique({
      where: { modelName: model }
    });

    if (!pricing) {
      return next(); // Skip if pricing not found
    }

    // Calculate actual cost
    const actualCost = ((tokensIn * pricing.pricePerTokenIn) + 
                       (tokensOut * pricing.pricePerTokenOut)) / 1000;

    // Deduct from wallet
    await prisma.userWallet.update({
      where: { userId },
      data: { balance: { decrement: actualCost } }
    });

    // Record usage
    await prisma.lLmUsage.create({
      data: {
        userId,
        model,
        tokensIn: parseInt(tokensIn),
        tokensOut: parseInt(tokensOut),
        cost: parseFloat(actualCost.toFixed(6))
      }
    });

    res.locals.cpaCharged = true;
    res.locals.cpaCost = actualCost;
    res.locals.cpaTokensIn = tokensIn;
    res.locals.cpaTokensOut = tokensOut;

    next();
  } catch (error) {
    console.error('Finalize charge error:', error);
    res.status(500).json({ error: 'Failed to charge CPA' });
  }
};

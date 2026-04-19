/**
 * Seed CPA Pricing - Fixed field names and Prisma model names
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pricingData = [
  // xAI Grok
  { model: 'grok-beta',               provider: 'grok',      priceIn: 5.00,  priceOut: 15.00 },
  { model: 'grok-2-latest',           provider: 'grok',      priceIn: 2.00,  priceOut: 10.00 },

  // Anthropic Claude
  { model: 'claude-opus-4-5',                  provider: 'anthropic', priceIn: 15.00, priceOut: 75.00 },
  { model: 'claude-sonnet-4-5',        provider: 'anthropic', priceIn: 3.00,  priceOut: 15.00 },
  { model: 'claude-3-5-haiku-20241022',provider: 'anthropic', priceIn: 0.80,  priceOut: 4.00  },
  { model: 'claude-3-haiku-20240307',  provider: 'anthropic', priceIn: 0.25,  priceOut: 1.25  },

  // OpenAI
  { model: 'gpt-4o',                  provider: 'openai',    priceIn: 2.50,  priceOut: 10.00 },
  { model: 'gpt-4-turbo',             provider: 'openai',    priceIn: 10.00, priceOut: 30.00 },
  { model: 'gpt-3.5-turbo',           provider: 'openai',    priceIn: 0.50,  priceOut: 1.50  },

  // DeepSeek
  { model: 'deepseek-chat',           provider: 'deepseek',  priceIn: 0.14,  priceOut: 0.28  },
  { model: 'deepseek-reasoner',       provider: 'deepseek',  priceIn: 0.27,  priceOut: 1.10  },

  // Google
  { model: 'gemini-1.5-pro',          provider: 'google',    priceIn: 1.25,  priceOut: 5.00  },
  { model: 'gemini-1.5-flash',        provider: 'google',    priceIn: 0.075, priceOut: 0.30  },

  // Mistral
  { model: 'mistral-large-latest',    provider: 'mistral',   priceIn: 2.00,  priceOut: 6.00  },
  { model: 'mistral-small-latest',    provider: 'mistral',   priceIn: 0.30,  priceOut: 0.90  },

  // OpenRouter (proxy)
  { model: 'openrouter/auto',         provider: 'openrouter',priceIn: 1.00,  priceOut: 3.00  },

  // Kilo Kiro (proxy)
  { model: 'kilo_kiro/default',       provider: 'kilo_kiro', priceIn: 1.00,  priceOut: 3.00  },

  // Antigravity (proxy)
  { model: 'antigravity/default',     provider: 'antigravity',priceIn: 1.00, priceOut: 3.00  },
];

async function main() {
  console.log('🌱 Seeding CPA pricing...');
  let count = 0;
  for (const item of pricingData) {
    // FIX: use lLMPriceConfig (Prisma auto-generates camelCase from model name LLMPriceConfig)
    // FIX: field is 'modelName' not 'model'
    await prisma.lLMPriceConfig.upsert({
      where:  { modelName: item.model },
      update: { pricePerTokenIn: item.priceIn / 1_000_000, pricePerTokenOut: item.priceOut / 1_000_000, provider: item.provider },
      create: { modelName: item.model, provider: item.provider, pricePerTokenIn: item.priceIn / 1_000_000, pricePerTokenOut: item.priceOut / 1_000_000 },
    });
    count++;
  }
  console.log(`✅ ${count} pricing records seeded`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

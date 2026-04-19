/**
 * Deploy CPA System to Railway or Vercel
 * 
 * Usage:
 * 1. Add DATABASE_URL to your platform
 * 2. Run: node scripts/deploy-setup.js
 * 3. Deploy to platform
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

async function deploySetup() {
  console.log('🚀 Deploying CPA System...\n');

  try {
    // Check environment variables
    const envPath = path.join(__dirname, '.env');
    const envContent = await fs.readFile(envPath, 'utf8');
    
    const hasDatabaseUrl = envContent.includes('DATABASE_URL');
    const hasJwtSecret = envContent.includes('JWT_SECRET');
    
    console.log('📋 Environment Check:');
    console.log(`  ✅ DATABASE_URL: ${hasDatabaseUrl ? 'Set' : 'Missing'}`);
    console.log(`  ✅ JWT_SECRET: ${hasJwtSecret ? 'Set' : 'Missing'}`);
    
    if (!hasDatabaseUrl) {
      console.log('\n⚠️  DATABASE_URL not set!');
      console.log('Please set DATABASE_URL in your platform environment variables.');
      console.log('Example: postgresql://user:password@host:5432/dbname');
      process.exit(1);
    }
    
    // Test database connection
    console.log('\n🗄️  Testing database connection...');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully!');
    } catch (error) {
      console.error('❌ Database connection failed!');
      console.error(error.message);
      console.log('\n💡 Tips:');
      console.log('  - Check DATABASE_URL is correct');
      console.log('  - Ensure database server is accessible');
      console.log('  - Check firewall settings');
      process.exit(1);
    }
    
    // Check for existing migrations
    console.log('\n📦 Checking for migrations...');
    try {
      const migrationCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "_prisma_migrations"
      `;
      
      const count = migrationCount[0]?.count || 0;
      console.log(`  Found ${count} existing migration(s)`);
      
      if (count === 0) {
        console.log('\n💡 No migrations found!');
        console.log('Creating initial CPA system tables...');
        
        // Create tables
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "UserWallet" (
            "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
            "userId" TEXT UNIQUE NOT NULL,
            "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "currency" TEXT NOT NULL DEFAULT 'USD',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
          );
          
          CREATE TABLE IF NOT EXISTS "LLMUsage" (
            "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
            "userId" TEXT NOT NULL,
            "model" TEXT NOT NULL,
            "tokensIn" INTEGER NOT NULL DEFAULT 0,
            "tokensOut" INTEGER NOT NULL DEFAULT 0,
            "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE TABLE IF NOT EXISTS "LLMPriceConfig" (
            "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
            "modelName" TEXT UNIQUE NOT NULL,
            "pricePerTokenIn" DOUBLE PRECISION NOT NULL DEFAULT 0.001,
            "pricePerTokenOut" DOUBLE PRECISION NOT NULL DEFAULT 0.002,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
          );
          
          CREATE TABLE IF NOT EXISTS "TransactionHistory" (
            "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
            "userId" TEXT NOT NULL,
            "amount" DOUBLE PRECISION NOT NULL,
            "type" TEXT NOT NULL,
            "currency" TEXT NOT NULL DEFAULT 'USD',
            "status" TEXT NOT NULL DEFAULT 'COMPLETED',
            "paymentMethod" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        console.log('✅ Tables created successfully!');
      } else {
        console.log('  Existing migrations detected');
      }
    } catch (error) {
      console.error('❌ Migration check failed:', error.message);
    } finally {
      await prisma.$disconnect();
    }
    
    console.log('\n✅ Deployment setup complete!');
    console.log('\n📊 Next steps:');
    console.log('  1. Push code to GitHub');
    console.log('  2. Connect to Railway/Vercel');
    console.log('  3. Set DATABASE_URL environment variable');
    console.log('  4. Deploy!');
    console.log('\n💰 Don\'t forget to seed pricing data:');
    console.log('   node scripts/seed-cpa-pricing.js\n');
    
  } catch (error) {
    console.error('❌ Deployment setup failed:', error);
    process.exit(1);
  }
}

// Run
deploySetup();

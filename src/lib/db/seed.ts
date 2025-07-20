import { db, closeDatabaseConnection } from './index';
import { workflows } from './schema';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Insert default workflows
    const defaultWorkflows = [
      {
        name: 'ProductHunt Daily Scraper',
        type: 'products' as const,
        webhookUrl: 'https://your-app.railway.app/api/webhooks/products',
        isActive: true,
      },
      {
        name: 'AI Analysis Generator',
        type: 'analysis' as const,
        webhookUrl: 'https://your-app.railway.app/api/webhooks/analysis',
        isActive: true,
      },
    ];

    console.log('📝 Inserting default workflows...');
    
    for (const workflow of defaultWorkflows) {
      await db.insert(workflows).values(workflow).onConflictDoNothing();
    }

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed();
}

export { seed };
const { execSync } = require('child_process');

console.log('🚀 Pushing database schema to Railway PostgreSQL...\n');

console.log('This will create the following tables:');
console.log('- workflows (for n8n workflow configurations)');
console.log('- products (for ProductHunt product data)');
console.log('- analysis_reports (for AI analysis results)\n');

console.log('⚠️  IMPORTANT: When prompted, type "1" or use arrow keys to select "Yes, I want to execute all statements"\n');

try {
  // Run drizzle-kit push with stdio set to inherit to allow interaction
  execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
  console.log('\n✅ Database schema pushed successfully!');
} catch (error) {
  console.error('\n❌ Error pushing database schema:', error.message);
  process.exit(1);
}
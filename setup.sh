#!/bin/bash

echo "🚀 ProductHunt Scraper App Setup"
echo "================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local - Please update it with your actual values"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if database URL is set
if grep -q "DATABASE_URL=postgresql://postgres:password" .env.local; then
    echo ""
    echo "⚠️  Please update DATABASE_URL in .env.local with your Railway PostgreSQL connection string"
    echo "   You can find this in your Railway project dashboard"
fi

# Check if Supabase URLs are set
if grep -q "NEXT_PUBLIC_SUPABASE_URL=..." .env.local; then
    echo ""
    echo "⚠️  Please update Supabase configuration in .env.local:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
fi

echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Run 'npm run db:push' to create database tables"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "✨ Setup complete!"
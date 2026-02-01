#!/bin/bash

# Environment Verification Script
# This script checks if your .env file is properly configured for local development

echo "🔍 M2DG Environment Configuration Checker"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Please create a .env file by running: cp .env.example .env"
    echo "   Then add your Supabase credentials to the .env file"
    exit 1
fi

echo "✅ .env file exists"

# Check if .env file has the required variables
if grep -q "VITE_SUPABASE_URL=your-project-url" .env || grep -q "VITE_SUPABASE_URL=$" .env; then
    echo "⚠️  Warning: VITE_SUPABASE_URL is not configured"
    echo "   Current value: placeholder"
    echo "   Please update .env with your actual Supabase URL"
    MISSING=1
elif grep -q "VITE_SUPABASE_URL=" .env; then
    echo "✅ VITE_SUPABASE_URL is configured"
else
    echo "❌ VITE_SUPABASE_URL is missing"
    MISSING=1
fi

if grep -q "VITE_SUPABASE_ANON_KEY=your-anon-key" .env || grep -q "VITE_SUPABASE_ANON_KEY=$" .env; then
    echo "⚠️  Warning: VITE_SUPABASE_ANON_KEY is not configured"
    echo "   Current value: placeholder"
    echo "   Please update .env with your actual Supabase anon key"
    MISSING=1
elif grep -q "VITE_SUPABASE_ANON_KEY=" .env; then
    echo "✅ VITE_SUPABASE_ANON_KEY is configured"
else
    echo "❌ VITE_SUPABASE_ANON_KEY is missing"
    MISSING=1
fi

echo ""
echo "Node Modules:"
if [ -d node_modules ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies not installed"
    echo "   Please run: npm ci"
fi

echo ""
echo "==========================================\n"

if [ "$MISSING" = "1" ]; then
    echo "⚠️  Configuration incomplete!"
    echo ""
    echo "📖 Next Steps:"
    echo "1. Get your Supabase credentials from https://app.supabase.com"
    echo "2. Update your .env file with the actual values"
    echo "3. Run this script again to verify"
    echo "4. Start the dev server with: npm run dev"
    echo ""
    echo "For detailed instructions, see: ENV_SETUP.md"
    exit 1
else
    echo "✅ Environment is properly configured!"
    echo ""
    echo "🚀 Ready to start development:"
    echo "   npm run dev"
    echo ""
    echo "📋 To test authentication, see: AUTH_TESTING.md"
fi

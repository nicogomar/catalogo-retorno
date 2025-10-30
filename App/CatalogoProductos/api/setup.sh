#!/bin/bash

# Catalogo KDN API - Setup Script
# This script helps you set up the API backend quickly

echo "🚀 Catalogo KDN API - Setup Script"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please edit the .env file and add your Supabase credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "   You can find these values in your Supabase project settings:"
    echo "   https://app.supabase.com/project/YOUR_PROJECT/settings/api"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Summary
echo "✨ Setup completed successfully!"
echo ""
echo "📚 Next steps:"
echo "   1. Edit the .env file with your Supabase credentials"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. The API will be available at http://localhost:3000"
echo ""
echo "📖 For more information, see the README.md file"
echo ""
echo "Happy coding! 🎉"

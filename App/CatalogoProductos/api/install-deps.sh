#!/bin/bash

# Installation script for Catálogo Productos API dependencies
echo "Installing dependencies for Catálogo Productos API..."

# Change to the api directory
cd "$(dirname "$0")"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies
npm install --save cookie-parser

# Check if the installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Successfully installed cookie-parser"
    echo "You may need to update package.json to include this dependency permanently"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Reminder about types
echo "Don't forget to install the types for cookie-parser if using TypeScript:"
echo "npm install --save-dev @types/cookie-parser"

echo "Done! The API is now ready to use cookie-parser middleware."

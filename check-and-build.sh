#!/bin/bash

# Script to run TypeScript type checking and build
# Exits with error code if any step fails

set -e  # Exit on any error

echo "🔍 Running TypeScript type check (tsc --noEmit)..."
echo ""

# Run TypeScript type checking
if ! pnpm exec tsc --noEmit; then
    echo ""
    echo "❌ TypeScript type check failed!"
    exit 1
fi

echo ""
echo "✅ TypeScript type check passed!"
echo ""
echo "🔨 Running build (pnpm build)..."
echo ""

# Run build
if ! pnpm build; then
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"



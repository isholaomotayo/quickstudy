#!/bin/bash

# Test script for Course Import/Export functionality
# This script runs the TypeScript test file

set -e

echo "=========================================="
echo "Course Import/Export Test Suite"
echo "=========================================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Check if tsx or ts-node is available
if command -v tsx &> /dev/null; then
    echo "Using tsx to run tests..."
    echo ""
    tsx scripts/test-course-import-export.ts
elif command -v ts-node &> /dev/null; then
    echo "Using ts-node to run tests..."
    echo ""
    ts-node scripts/test-course-import-export.ts
else
    echo "Error: Neither tsx nor ts-node is installed"
    echo "Please install one of them:"
    echo "  npm install -g tsx"
    echo "  or"
    echo "  npm install -g ts-node"
    exit 1
fi



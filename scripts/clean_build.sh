#!/bin/bash
set -e

echo "🧹 Cleaning project..."

echo "🗑️  Removing node_modules..."
rm -rf node_modules

echo "🗑️  Removing ios/Pods..."
rm -rf ios/Pods

echo "🗑️  Removing ios/build..."
rm -rf ios/build

echo "🗑️  Removing ios/DerivedData..."
rm -rf ios/DerivedData

echo "🗑️  Removing Podfile.lock..."
rm -f ios/Podfile.lock

echo "✨ Project cleaned. Now reinstalling dependencies."

#!/bin/bash
# ATFITK Backend — Скрипт первого запуска на VPS
# Запускать от имени обычного пользователя (не root)
# chmod +x setup.sh && ./setup.sh

set -e

echo "=============================="
echo " ATFITK Backend Setup"
echo "=============================="

# 1. Установить зависимости Node.js
echo ""
echo "📦 Installing dependencies..."
npm install

# 2. Собрать TypeScript
echo ""
echo "🔨 Building TypeScript..."
npm run build

# 3. Создать папки
echo ""
echo "📁 Creating directories..."
mkdir -p uploads logs

# 4. Проверить наличие .env
if [ ! -f ".env" ]; then
  echo ""
  echo "⚠️  .env file not found!"
  echo "   Copy .env.example to .env and fill in your values:"
  echo "   cp .env.example .env && nano .env"
  exit 1
fi

# 5. Запустить миграции
echo ""
echo "🗄️  Running database migrations..."
npm run migrate

# 6. Создать пользователей
echo ""
echo "🌱 Seeding users..."
npm run seed

# 7. Запустить через PM2
echo ""
echo "🚀 Starting with PM2..."
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Backend is running!"
echo "   API: http://localhost:3001/api/health"
echo ""
echo "📋 Login credentials:"
echo "   Director:     director    / Atfitk@Dir2024!"
echo "   Psychologist: psychologist / Psy#Atfitk2024!"

# ATFITK Backend — Инструкция по деплою на VPS

## 📋 Требования
- Node.js 18+ (`node -v`)
- PostgreSQL 14+ (запущен и доступен)
- PM2 (`npm install -g pm2`)

---

## 🚀 Деплой на VPS (78.40.109.66)

### 1. Скопировать папку `backend/` на сервер

```bash
# С локальной машины:
scp -r ./backend user@78.40.109.66:/home/user/atfitk-backend

# Или через git
git clone <your-repo> && cd <repo>/backend
```

### 2. Настроить базу данных PostgreSQL

```bash
# Подключиться к PostgreSQL
psql -U postgres

# Создать БД
CREATE DATABASE atfitk;
\q
```

### 3. Заполнить .env файл

```bash
cp .env.example .env
nano .env
```

Заполнить:
```
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/atfitk
JWT_SECRET=YOUR_VERY_LONG_RANDOM_SECRET_KEY_HERE
UPLOADS_DIR=./uploads
BASE_URL=http://78.40.109.66:3001
FRONTEND_URL=https://atfitk-websystem.vercel.app
```

### 4. Запустить автоматический скрипт установки

```bash
chmod +x setup.sh
./setup.sh
```

Скрипт автоматически:
- 📦 Установит зависимости `npm install`
- 🔨 Соберёт TypeScript `npm run build`
- 🗄️ Создаст таблицы в БД (миграции)
- 🌱 Создаст аккаунты director/psychologist
- 🚀 Запустит через PM2

---

## 📋 PM2 команды

```bash
# Статус
pm2 status

# Логи
pm2 logs atfitk-backend

# Перезапуск
pm2 restart atfitk-backend

# Остановить
pm2 stop atfitk-backend

# Автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

---

## 🔑 Данные для входа

| Роль | Логин | Пароль |
|------|-------|--------|
| Зам. директора | `director` | `Atfitk@Dir2024!` |
| Психолог | `psychologist` | `Psy#Atfitk2024!` |

---

## 🧪 Проверка работы

```bash
# Health check
curl http://localhost:3001/api/health

# Тест логина
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"director","password":"Atfitk@Dir2024!"}'
```

---

## 📁 Структура папки

```
backend/
├── src/
│   ├── index.ts          # Express сервер
│   ├── db.ts             # PostgreSQL подключение
│   ├── seed.ts           # Создание аккаунтов
│   ├── middleware/
│   │   └── auth.ts       # JWT middleware
│   ├── routes/
│   │   ├── auth.ts       # /api/auth/*
│   │   ├── students.ts   # /api/students/*
│   │   └── photos.ts     # /api/students/:id/photo
│   └── migrations/
│       ├── 001_init.sql  # Схема БД
│       └── run.ts        # Запуск миграций
├── uploads/              # Фото студентов (создаётся автоматически)
├── logs/                 # PM2 логи (создаётся автоматически)
├── dist/                 # Скомпилированный JS (после npm run build)
├── ecosystem.config.js   # PM2 конфиг
├── setup.sh              # Скрипт первого запуска
├── .env                  # Конфиг (создать из .env.example)
└── .env.example          # Пример конфига
```

---

## 🔧 Если нужно обновить backend

```bash
cd /home/user/atfitk-backend

# Загрузить новые файлы
git pull  # или scp

# Пересобрать
npm install
npm run build

# Перезапустить
pm2 restart atfitk-backend
```

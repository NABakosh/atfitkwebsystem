module.exports = {
    apps: [
        {
            name: 'atfitk-backend',
            script: 'dist/index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                DATABASE_URL: 'postgres://atfitk_user:PASSWORD@localhost:5432/atfitk_db',
                JWT_SECRET: 'REPLACE_WITH_SECURE_SECRET',
                FRONTEND_URL: 'https://atfitkwebsystem.kz',
                BASE_URL: 'https://atfitkwebsystem.kz/api',
            },
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        },
    ],
};

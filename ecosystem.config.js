module.exports = {
    apps: [
        {
            name: 'catalog-lidl',
            script: '.next/standalone/server.js',
            cwd: '/var/www/catalog-lidl',
            env: {
                PORT: 3501,
                NODE_ENV: 'production',
                HOSTNAME: '0.0.0.0',
            },
            instances: 1,
            autorestart: true,
            max_memory_restart: '512M',
        },
        {
            name: 'catalog-lidl-watcher',
            script: 'scripts/watch-trigger.js',
            cwd: '/var/www/catalog-lidl',
            instances: 1,
            autorestart: true,
            max_memory_restart: '128M',
        },
    ],
};

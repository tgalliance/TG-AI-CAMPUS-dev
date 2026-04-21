module.exports = {
  apps: [
    {
      name: 'webapp',
      script: 'npx',
      args: 'http-server . -p 3000 --cors -c-1 -a 0.0.0.0',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 1000,
      max_restarts: 10
    }
  ]
}

module.exports = {
  apps: [
    {
      name: 'Discord Bot (Pico)',
      script: 'bun run start',
      watch: false,
      version: '1.0.0',
      namespace: 'Discord',
      env: {
        FORCE_COLOR: true,
      },
    },
  ],

  deploy: {
    production: {
      user: 'nimda',
      host: '192.168.116.137',
      ref: 'origin/master',
      repo: 'https://github.com/n1md7-th/discord-bot.git',
      path: '/home/nimda/apps/discord-bot-test',
      'post-deploy': 'bun i',
      'pre-setup': '',
    },
  },
};

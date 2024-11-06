import { DiscordBot } from './bot/discord.bot.ts';
import { token } from './config';
import { connection } from './db/connection.ts';
import { Logger } from './utils/logger.ts';

const logger = new Logger({ label: 'Bot' });
const discordBot = new DiscordBot(logger, connection);
const stopServiceExecution = () => {
  process.exit(1);
};

discordBot
  .subscribe()
  .login(token)
  .catch((error) => {
    logger.error('Bot start failed: ', error);
    stopServiceExecution();
  });

process
  .on('exit', () => {
    discordBot.unsubscribe();
    connection.close(false);
    logger.info('Bot has been stopped');
  })
  .on('SIGINT', stopServiceExecution) // Ctrl + C
  .on('uncaughtException', (error, origin) => {
    logger.error('Uncaught exception:', error, origin);
    stopServiceExecution();
  });

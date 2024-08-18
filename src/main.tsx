import { DiscordBot } from './bot/discord.bot.ts';
import { token } from './config';
import { Logger } from './utils/logger.ts';

const logger = new Logger('Bot');

const discordBot = new DiscordBot(logger);

discordBot
  .subscribe()
  .login(token)
  .catch((error) => {
    logger.error('Bot start failed: ', error);
    process.exit(1);
  });

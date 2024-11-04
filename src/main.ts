import * as scheduler from '@db/workers/repositories/scheduler.repository.ts';
import { DiscordBot } from './bot/discord.bot.ts';
import { token } from './config';
import { connection } from './db/connection.ts';
import { Logger } from './utils/logger.ts';

const logger = new Logger({ label: 'Bot' });
const discordBot = new DiscordBot(logger, connection);
const stopServiceExecution = () => {
  scheduler.serializeDatabase().finally(() => process.exit(0));
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
    process.exit(1);
  });

await Promise.all([
  scheduler.insertOne('Hello, World!'),
  scheduler.insertOne('Hello, Deno!'),
  scheduler.insertOne('Hello, TypeScript!'),
  scheduler.insertOne('Hello, SQLite!'),
  scheduler.insertOne('Hello, Worker!'),
]);

setInterval(() => {
  Promise.all([
    scheduler.insertOne('Hola, Mundo!'),
    scheduler.insertOne('Hola, Deno!'),
    scheduler.insertOne('Hola, TypeScript!'),
  ]);
}, 3000);
const data = await scheduler.fetchMany();

logger.info('Data:', data);

// scheduler.terminate();

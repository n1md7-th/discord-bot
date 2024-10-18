import type { Message } from 'discord.js';
import type { Context } from '@utils/context.ts';
import type { DiscordBot } from '@bot/discord.bot.ts';

export abstract class CreateHandler {
  constructor(protected readonly bot: DiscordBot) {}

  abstract handle(message: Message, context: Context): Promise<any>;
}

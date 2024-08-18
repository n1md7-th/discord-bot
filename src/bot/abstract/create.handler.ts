import type { Message } from 'discord.js';
import type { DiscordBot } from '../discord.bot.ts';

export abstract class CreateHandler {
  constructor(protected readonly bot: DiscordBot) {}

  abstract handle(message: Message): Promise<void>;
}

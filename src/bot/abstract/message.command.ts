import { Message } from 'discord.js';
import { DiscordBot } from '../discord.bot.ts';

export abstract class MessageCommand {
  constructor(protected readonly bot: DiscordBot) {}

  abstract execute(message: Message<boolean>): Promise<void>;
}

import { Message } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { DiscordBot } from '../../discord.bot.ts';

export abstract class MessageCommandHandler {
  constructor(protected readonly bot: DiscordBot) {}

  abstract execute(message: Message<boolean>, context: Context): Promise<void>;

  abstract removeCommandPrefix(message: string): string;
}

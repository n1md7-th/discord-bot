import { MessageReaction, type PartialMessageReaction, type PartialUser, type User } from 'discord.js';
import type { Context } from '../../utils/context.ts';
import { DiscordBot } from '../discord.bot.ts';

export abstract class ReactionCommand {
  constructor(protected readonly bot: DiscordBot) {}

  abstract execute(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
    context: Context,
  ): Promise<void>;
}

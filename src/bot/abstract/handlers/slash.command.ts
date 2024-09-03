import { type CacheType, type ChatInputCommandInteraction, type SlashCommandBuilder } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { DiscordBot } from '../../discord.bot.ts';

export abstract class SlashCommandHandler {
  constructor(protected readonly bot: DiscordBot) {}

  abstract register(): SlashCommandBuilder;

  abstract execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void>;
}

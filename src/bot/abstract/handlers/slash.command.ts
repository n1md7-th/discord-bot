import { DiscordBot } from '@bot/discord.bot.ts';
import type { Context } from '@utils/context.ts';
import {
  type AutocompleteInteraction,
  type CacheType,
  type ChatInputCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export abstract class SlashCommandHandler {
  constructor(protected readonly bot: DiscordBot) {}

  abstract register():
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

  abstract execute(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ): Promise<void>;

  async autocomplete(interaction: AutocompleteInteraction<CacheType>): Promise<void> {}
}

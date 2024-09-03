import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { SlashCommandHandler } from '../../abstract/handlers/slash.command.ts';

export class PingCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    await interaction.reply('Pong!');
  }
}

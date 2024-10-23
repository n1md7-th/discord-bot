import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { Context } from '@utils/context.ts';
import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';

export class SanitizeCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('sanitize')
      .addStringOption((option) => {
        return option.setName('text').setRequired(true).setDescription('The input to sanitize');
      })
      .setDescription('Sanitize the content of the message from Social Media tracking');
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    await interaction.deferReply();

    try {
      await interaction.followUp({
        content: await this.sanitizeUrl(interaction.options.getString('text') ?? ''),
      });
    } catch (error) {
      context.logger.error('Failed to sanitize the URL', error);
      await interaction.followUp({
        content: 'Failed to sanitize the URL',
      });
    }
  }

  private async sanitizeUrl(url: string) {
    return this.bot.services.analyzer.removeTrackers(url);
  }
}

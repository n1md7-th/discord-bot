import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';
import type { Context } from '@utils/context.ts';

export class SanitizeCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('sanitize')
      .addStringOption((option) => {
        return option.setName('text').setRequired(true).setDescription('The input to sanitize');
      })
      .setDescription('Sanitize text from trackers. Works with any text that contains URL(s)');
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    await this.sanitizeUrl(interaction.options.getString('text') ?? '')
      .then((text) =>
        interaction.followUp({
          content: `Text sanitized. You can copy it with one click below. :arrow_heading_down: \n\n\`\`\`text\n${text}\n\`\`\`\n\n`,
        }),
      )
      .catch((error) => {
        context.logger.error('Failed to sanitize the URL', error);
        interaction.followUp('Failed to sanitize the URL');
      });
  }

  private async sanitizeUrl(url: string) {
    return this.bot.services.analyzer.removeTrackers(url);
  }
}

import {
  type CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  type User,
} from 'discord.js';
import type { Context } from '@utils/context.ts';
import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';

export class SayCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('say')
      .setDescription('Replies with the text provided')
      .addStringOption((option) =>
        option.setName('text').setRequired(true).setDescription('The text to say'),
      )
      .addUserOption((option) =>
        option.setName('to').setRequired(false).setDescription('The user to DM the text to'),
      );
  }

  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ): Promise<void> {
    const text = interaction.options.getString('text', true);
    const user = interaction.options.getUser('to');

    await interaction.deferReply({ ephemeral: !!user });

    try {
      if (user) return await this.dmUser(user, text, interaction);

      await this.sentMessage(text, interaction);
    } catch (error) {
      context.logger.error('Failed to send the message', error);
      await interaction.followUp({
        content: 'Failed to send the message',
        ephemeral: true,
      });
    }
  }

  private async dmUser(
    user: User,
    text: string,
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    await user.send(text);
    await interaction.followUp({ content: `Message sent to ${user.username}`, ephemeral: true });
  }

  private async sentMessage(content: string, interaction: ChatInputCommandInteraction<CacheType>) {
    return await interaction.editReply({ content });
  }
}

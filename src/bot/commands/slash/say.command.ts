import { delay } from '@utils/delay.ts';
import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder, type User } from 'discord.js';
import type { Context } from '@utils/context.ts';
import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';
import ms from 'ms';

export class SayCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('say')
      .setDescription('Replies with the text provided')
      .addStringOption((option) => option.setName('text').setRequired(true).setDescription('The text to say'))
      .addStringOption((option) =>
        option
          .setName('when')
          .addChoices(
            {
              name: 'Now',
              value: '0s',
            },
            {
              name: 'In 30 seconds',
              value: '30s',
            },
            {
              name: 'In 1 minute',
              value: '1m',
            },
            {
              name: 'In 5 minutes',
              value: '5m',
            },
            {
              name: 'In 15 minutes',
              value: '15m',
            },
            {
              name: 'In 30 minutes',
              value: '30m',
            },
            {
              name: 'In 1 hour',
              value: '1h',
            },
            {
              name: 'In 2 hours',
              value: '2h',
            },
            {
              name: 'In 6 hours',
              value: '6h',
            },
            {
              name: 'In 12 hours',
              value: '12h',
            },
            {
              name: 'In 1 day',
              value: '1d',
            },
          )
          .setRequired(false)
          .setDescription('When to say the text'),
      )
      .addUserOption((option) => option.setName('to').setRequired(false).setDescription('The user to DM the text to'));
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    const text = interaction.options.getString('text', true);
    const user = interaction.options.getUser('to');
    const when = interaction.options.getString('when');
    const ephemeral = (!!when && when !== '0s') || !!user; // If not scheduler we show the message to everyone

    await interaction.deferReply({ ephemeral });

    try {
      if (user) return await this.dmUser(user, text, interaction, when);

      await this.sentMessage(text, interaction, when);
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
    when: string | null,
  ) {
    if (!when || when === '0s') {
      await user.send(text);
      await interaction.followUp({ content: `Message sent to ${user.username}`, ephemeral: true });

      return void 0;
    }

    await interaction.followUp({
      content: `Message scheduled to be sent to ${user.username} in ${when}`,
      ephemeral: true,
    });
    delay(ms(when)).then(() => {
      user.send(text);
      interaction.followUp({
        content: `Message sent to ${user.username} after **${when}**`,
        ephemeral: true,
      });
    });
  }

  private async sentMessage(content: string, interaction: ChatInputCommandInteraction<CacheType>, when: string | null) {
    if (!when || when === '0s') return await interaction.editReply({ content });

    await interaction.editReply({ content: `Will send the message in ${when}` });
    delay(ms(when)).then(() => interaction.editReply({ content }));
  }
}

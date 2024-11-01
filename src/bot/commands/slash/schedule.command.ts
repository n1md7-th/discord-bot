import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';
import { SchedulerAuthorStrategy, SchedulerSendStrategy } from '@db/enums/conversation.enum.ts';
import type { Context } from '@utils/context.ts';
import { type CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ms from 'ms';

export class ScheduleCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('schedule')
      .setDescription('Schedule a message to be sent in the future')
      .addStringOption((option) => option.setName('name').setRequired(true).setDescription('The name of the schedule'))
      .addStringOption((option) =>
        option
          .setName('when')
          .addChoices(
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
          .setRequired(true)
          .setDescription('When to say the text'),
      )
      .addStringOption((option) => option.setName('text').setRequired(true).setDescription('The text to say'));
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>, context: Context): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const text = interaction.options.getString('text', true);
    const name = interaction.options.getString('name', true);
    const when = interaction.options.getString('when', true);

    try {
      if (!interaction.channel?.id) {
        await interaction.followUp({
          content: 'This command is only available in a server',
          ephemeral: true,
        });

        return void 0;
      }

      await this.bot.schedules.create({
        name,
        userId: interaction.user.id,
        payload: text,
        targetId: interaction.channel.id,
        runAt: this.calculatedRunAt(when),
        authorStrategy: SchedulerAuthorStrategy.Bot,
        sendStrategy: SchedulerSendStrategy.Channel,
      });

      await interaction.followUp({
        content: `Scheduled message to be sent in ${when}`,
        ephemeral: true,
      });
    } catch (error) {
      context.logger.error('Failed to send the message', error);
      await interaction.followUp({
        content: 'Failed to send the message',
        ephemeral: true,
      });
    }
  }

  private calculatedRunAt(when: string) {
    return new Date(Date.now() + ms(when)).toISOString();
  }
}

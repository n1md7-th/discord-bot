import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';
import {
  SchedulerAuthorStrategy,
  SchedulerSendStrategy,
  SchedulerStatusEnum,
} from '@db/enums/scheduler.enum.ts';
import type { Context } from '@utils/context.ts';
import {
  AutocompleteInteraction,
  type CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import ms from 'ms';

export class ScheduleCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('schedule')
      .setDescription('Schedule or cancel a message')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('create')
          .setDescription('Create a new scheduled task')
          .addStringOption((option) =>
            option
              .setName('when')
              .setDescription('Choose a time to schedule')
              .setRequired(true)
              .addChoices(...this.getChoices()),
          )
          .addStringOption((option) =>
            option.setName('name').setDescription('Name of the schedule').setRequired(true),
          )
          .addStringOption((option) =>
            option.setName('text').setDescription('Text to be scheduled').setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('cancel')
          .setDescription('Cancel a scheduled task')
          .addStringOption(
            (option) =>
              option
                .setName('schedule_id')
                .setDescription('Select the ID of the task to cancel')
                .setRequired(true)
                .setAutocomplete(true), // Enables dynamic suggestions for IDs from the database
          ),
      );
  }

  async execute(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'create':
        await this.handleCreateCommand(interaction, context);
        break;
      case 'cancel':
        await this.handleCancelCommand(interaction, context);
        break;
      default:
        this.bot.logger.error('Unknown subcommand', subcommand);
    }
  }

  override async autocomplete(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === 'schedule_id') {
      const options = this.bot.schedules
        .getManyByUserId(interaction.user.id)
        .filter((task) => task.status === SchedulerStatusEnum.Active)
        .map((task, id) => ({
          name: `#${id}, Task "${task.name}", scheduled at: ${this.getFormattedDate(task.runAt)}`,
          value: task.id,
        }))
        .reverse();

      options.push({
        name: 'Cancel all tasks',
        value: 'all',
      });
      await interaction.respond(options);
    }
  }

  private async handleCreateCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ) {
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

  private async handleCancelCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ) {
    const taskId = interaction.options.getString('schedule_id', true);

    try {
      if (taskId === 'all') {
        this.bot.schedules.cancelManyByUserId(interaction.user.id);
        await interaction.followUp({
          content: 'All scheduled messages have been cancelled',
          ephemeral: true,
        });
        return void 0;
      }

      this.bot.schedules.cancelOneBy(taskId);
      await interaction.followUp({
        content: `Scheduled message with ID ${taskId} has been cancelled`,
        ephemeral: true,
      });
    } catch (error) {
      context.logger.error('Failed to cancel the message', error);
      await interaction.followUp({
        content: 'Failed to cancel the message',
        ephemeral: true,
      });
    }
  }

  private calculatedRunAt(when: string) {
    return new Date(Date.now() + ms(when)).toISOString();
  }

  private getChoices() {
    return [
      {
        name: 'In 5 seconds',
        value: '5s',
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
      {
        name: 'In 2 days',
        value: '2d',
      },
      {
        name: 'In 1 week',
        value: '1w',
      },
    ];
  }

  private getFormattedDate(date: string) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).padStart(4, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
}

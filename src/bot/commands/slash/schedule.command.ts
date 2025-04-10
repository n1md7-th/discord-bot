import {
  AutocompleteInteraction,
  type CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { SlashCommandHandler } from '@bot/abstract/handlers/slash.command.ts';
import * as schedulerRepository from '@db/workers/repositories/scheduler.repository.ts';
import {
  SchedulerAuthorStrategy,
  SchedulerSendStrategy,
  SchedulerStatusEnum,
} from '@db/enums/scheduler.enum.ts';
import type { Context } from '@utils/context.ts';
import ms from 'ms';

export class ScheduleCommand extends SlashCommandHandler {
  register() {
    return new SlashCommandBuilder()
      .setName('schedule')
      .setDescription('Schedule or cancel a message')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('create-channel-message')
          .setDescription('Create a new scheduled task to send a message in a channel')
          .addIntegerOption((option) =>
            option.setName('in').setDescription('Choose time value').setRequired(true),
          )
          .addStringOption((option) =>
            option
              .setName('unit')
              .setDescription('Choose time unit')
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
          .setName('create-direct-message')
          .setDescription('Create a new scheduled task in DM')
          .addIntegerOption((option) =>
            option.setName('in').setDescription('Choose time value').setRequired(true),
          )
          .addStringOption((option) =>
            option
              .setName('unit')
              .setDescription('Choose time unit')
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
      case 'create-channel-message':
        await this.handleCreateChannelCommand(interaction, context);
        break;
      case 'create-direct-message':
        await this.handleCreateDirectMessageCommand(interaction, context);
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
      const jobs = await schedulerRepository.getAllByUserId({ userId: interaction.user.id });
      const options = jobs
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

  private async handleCreateChannelCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ) {
    const text = interaction.options.getString('text', true);
    const name = interaction.options.getString('name', true);
    const __in = interaction.options.getInteger('in', true);
    const unit = interaction.options.getString('unit', true);
    const when = `${__in}${unit}`;

    try {
      if (!interaction.channel) {
        return await interaction.followUp({
          content: 'This command is only available in a server',
          ephemeral: true,
        });
      }

      await this.bot.schedules.create({
        name,
        userId: interaction.user.id,
        payload: text,
        targetId: interaction.channel.id,
        runAt: this.calculatedRunAt(when),
        sendStrategy: SchedulerSendStrategy.Channel,
        authorStrategy: SchedulerAuthorStrategy.Bot,
      });

      await interaction.followUp({
        content: `Scheduled message to be sent in ${when} in this channel`,
        ephemeral: true,
      });
    } catch (error) {
      context.logger.error('Failed to send the (channel)message', error);
      await interaction.followUp({
        content: 'Failed to send the (channel)message',
        ephemeral: true,
      });
    }
  }

  private async handleCreateDirectMessageCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ) {
    const text = interaction.options.getString('text', true);
    const name = interaction.options.getString('name', true);
    const __in = interaction.options.getInteger('in', true);
    const unit = interaction.options.getString('unit', true);
    const when = `${__in}${unit}`;
    const to = interaction.options.getUser('to', true);

    try {
      await this.bot.schedules.create({
        name,
        userId: interaction.user.id,
        payload: text,
        targetId: to.id,
        runAt: this.calculatedRunAt(when),
        sendStrategy: SchedulerSendStrategy.DM,
        authorStrategy: SchedulerAuthorStrategy.Bot,
      });

      await interaction.followUp({
        content: `Scheduled (DM)message to be sent in ${when} to ${to.username}`,
        ephemeral: true,
      });
    } catch (error) {
      context.logger.error('Failed to send the (DM)message', error);
      await interaction.followUp({
        content: 'Failed to send the (DM)message',
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
        await this.bot.schedules.cancelManyByUserId(interaction.user.id);
        await interaction.followUp({
          content: 'All scheduled messages have been cancelled',
          ephemeral: true,
        });
        return void 0;
      }

      await this.bot.schedules.cancelOneBy(taskId);
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
        name: 'Seconds',
        value: 's',
      },
      {
        name: 'Minutes',
        value: 'm',
      },
      {
        name: 'Hours',
        value: 'h',
      },
      {
        name: 'Days',
        value: 'd',
      },
      {
        name: 'Weeks',
        value: 'w',
      },
      {
        name: 'Months',
        value: 'm',
      },
      {
        name: 'Years',
        value: 'y',
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

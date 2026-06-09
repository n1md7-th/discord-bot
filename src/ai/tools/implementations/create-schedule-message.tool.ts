import type { ToolExecutionResult, ToolParameter } from '@ai/tools';
import { AbstractTool } from '@ai/tools';
import { SchedulerAction } from '@bot/commands/slash/schedule.command.ts';
import { SchedulerAuthorStrategy, SchedulerSendStrategy } from '@db/enums/scheduler.enum.ts';
import type { Context } from '@utils/context.ts';
import ms from 'ms';

export class CreateScheduleMessageTool extends AbstractTool {
  getName(): string {
    return 'schedule_message';
  }

  getDescription(): string {
    return 'Schedule a message to be sent in the channel ';
  }

  getParameters(): Record<string, ToolParameter> {
    return {
      action: {
        enum: [
          SchedulerAction.CreateDirectMessage,
          SchedulerAction.CreateChannelMessage,
          SchedulerAction.Cancel,
        ],
        type: 'string',
        description:
          'The action to perform: create a scheduled message in a channel, ' +
          'create a scheduled message in direct messages',
      },
      in: {
        type: 'number',
        description: 'The time value after which the message should be sent. e.g., 10, 15, 30',
      },
      unit: {
        enum: ['seconds', 'minutes', 'hours', 'days'],
        type: 'string',
        description: 'The time unit for the "in" parameter.',
      },
      name: {
        type: 'string',
        description: 'The name of the scheduled message. e.g., "Daily Reminder", "Meeting Alert"',
      },
      text: {
        type: 'string',
        description: 'The content of the message to be scheduled.',
      },
    };
  }

  getRequiredParameters(): string[] {
    return ['action', 'name', 'in', 'unit', 'text'];
  }

  protected async executeInternal(
    parameters: {
      action: string;
      in: number;
      unit: string;
      name: string;
      text: string;
    },
    context: Context,
  ): Promise<ToolExecutionResult> {
    return await this.bot.schedules
      .create({
        name: parameters.name,
        userId: context.userId,
        payload: parameters.text,
        targetId: context.channelId,
        runAt: this.calculatedRunAt(parameters.in, parameters.unit),
        sendStrategy: SchedulerSendStrategy.Channel,
        authorStrategy: SchedulerAuthorStrategy.Pico,
      })
      .then(() => ({
        success: true,
        data: {
          message: `Scheduled message "${parameters.name}" to be sent in ${parameters.in} ${parameters.unit} in this channel.`,
        },
      }))
      .catch((error) => {
        const data = `Failed to schedule message "${parameters.name}".`;
        context.logger.error(data, error);

        return { success: false, error, data };
      });
  }

  private calculatedRunAt(_in: number, unit: string) {
    return new Date(Date.now() + ms(`${_in} ${unit}`)).toISOString();
  }
}

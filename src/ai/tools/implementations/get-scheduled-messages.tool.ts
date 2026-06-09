import type { ToolExecutionResult, ToolParameter } from '@ai/tools';
import { AbstractTool } from '@ai/tools';
import type { Context } from '@utils/context.ts';

export class GetScheduledMessagesTool extends AbstractTool {
  getName(): string {
    return 'get_scheduled_messages';
  }

  getDescription(): string {
    return 'Retrieve a list of scheduled messages';
  }

  getParameters(): Record<string, ToolParameter> {
    return {};
  }

  getRequiredParameters(): string[] {
    return [];
  }

  protected async executeInternal(
    parameters: Record<string, any>,
    context: Context,
  ): Promise<ToolExecutionResult> {
    return await this.bot.schedules
      .getManyByUserId(context.userId)
      .then((schedules) => {
        if (schedules.length === 0) {
          return {
            success: true,
            data: 'No scheduled messages found.',
          };
        }

        return {
          success: true,
          data: {
            schedules: schedules.map((schedule) => {
              return {
                id: schedule.id,
                name: schedule.name,
                status: schedule.status,
                createdBy: schedule.authorStrategy,
                createdAt: schedule.createdAt,
              };
            }),
            information:
              'Do not display UUIDs to end users unless specifically requested. ' +
              'Use numeric values and ask them to use value like 1,2,3 to refer to scheduled messages. ' +
              'If they want to cancel specific ones, ask them to provide the IDs from the list provided. ' +
              'In most cases they are interested in active scheduled messages only. ' +
              'So, only provide active ones unless they specifically ask for all scheduled messages.',
          },
        };
      })
      .catch((error) => {
        const data = 'Failed to retrieve scheduled messages.';
        context.logger.error(data, error);

        return { success: false, error, data };
      });
  }
}

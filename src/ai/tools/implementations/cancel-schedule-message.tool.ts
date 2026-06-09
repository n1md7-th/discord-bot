import type { ToolExecutionResult, ToolParameter } from '@ai/tools';
import { AbstractTool } from '@ai/tools';
import type { Context } from '@utils/context.ts';

export class CancelScheduleMessageTool extends AbstractTool {
  getName(): string {
    return 'cancel_schedule_message';
  }

  getDescription(): string {
    return 'Cancel a scheduled message';
  }

  getParameters(): Record<string, ToolParameter> {
    return {
      id: {
        type: 'string',
        description: "The ID of the scheduled message to cancel. It's UUID format.",
      },
    };
  }

  getRequiredParameters(): string[] {
    return ['id'];
  }

  protected async executeInternal(
    parameters: { id: string },
    context: Context,
  ): Promise<ToolExecutionResult> {
    return await this.bot.schedules
      .cancelOneBy(parameters.id)
      .then(() => ({
        success: true,
        data: {
          message: `Scheduled message with ID ${parameters.id} has been cancelled.`,
        },
      }))
      .catch((error) => {
        const data = `Scheduled message with ID ${parameters.id} not found or could not be cancelled.`;
        context.logger.error(data, error);

        return { success: false, error, data };
      });
  }
}

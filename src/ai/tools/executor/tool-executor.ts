import type { ToolCall, ToolCallResult, ToolExecutor, ToolRegistry } from '@ai/tools';
import type { Context } from '@utils/context.ts';

export class DefaultToolExecutor implements ToolExecutor {
  constructor(private readonly toolRegistry: ToolRegistry) {}

  async executeOne(toolCall: ToolCall, context: Context): Promise<ToolCallResult> {
    const { function: fn, id } = toolCall;

    try {
      const tool = this.toolRegistry.getTool(fn.name);
      if (!tool) {
        return this.rejectBy(`Tool '${fn.name}' not found`, id);
      }

      let parameters: Record<string, any>;
      try {
        parameters = JSON.parse(fn.arguments);
      } catch (parseError) {
        return this.rejectBy('Invalid tool arguments: malformed JSON', id);
      }

      const result = await tool.execute(parameters, context);

      return {
        tool_call_id: id,
        role: 'tool',
        content: JSON.stringify(result),
      };
    } catch (error) {
      context.logger.error(`Tool execution failed for ${fn.name}:`, error);
      return this.rejectBy(error instanceof Error ? error.message : 'Unknown error', id);
    }
  }

  async executeMany(toolCalls: ToolCall[], context: Context): Promise<ToolCallResult[]> {
    const results = await Promise.allSettled(
      toolCalls.map((toolCall) => this.executeOne(toolCall, context)),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        context.logger.error(`Tool call ${index} failed:`, result.reason);
        return {
          tool_call_id: toolCalls[index].id,
          role: 'tool',
          content: JSON.stringify({
            error: 'Tool execution failed',
            success: false,
          }),
        };
      }
    });
  }

  private rejectBy(message: string, id: string): ToolCallResult {
    return {
      tool_call_id: id,
      role: 'tool',
      content: JSON.stringify({
        error: message,
        success: false,
      }),
    };
  }
}

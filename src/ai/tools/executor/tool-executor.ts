import type { Context } from '@utils/context.ts';
import type {
  ToolCall,
  ToolCallResult,
  ToolExecutor,
} from '../interfaces/tool-executor.interface.ts';
import type { ToolRegistry } from '../interfaces/tool-registry.interface.ts';

export class DefaultToolExecutor implements ToolExecutor {
  constructor(private readonly toolRegistry: ToolRegistry) {}

  async executeToolCall(toolCall: ToolCall, context: Context): Promise<ToolCallResult> {
    const { function: fn, id } = toolCall;

    try {
      const tool = this.toolRegistry.getTool(fn.name);
      if (!tool) {
        return {
          tool_call_id: id,
          role: 'tool',
          content: JSON.stringify({
            error: `Tool '${fn.name}' not found`,
            success: false,
          }),
        };
      }

      let parameters: Record<string, any>;
      try {
        parameters = JSON.parse(fn.arguments);
      } catch (parseError) {
        return {
          tool_call_id: id,
          role: 'tool',
          content: JSON.stringify({
            error: 'Invalid tool arguments: malformed JSON',
            success: false,
          }),
        };
      }

      const result = await tool.execute(parameters, context);

      return {
        tool_call_id: id,
        role: 'tool',
        content: JSON.stringify(result),
      };
    } catch (error) {
      context.logger.error(`Tool execution failed for ${fn.name}:`, error);
      return {
        tool_call_id: id,
        role: 'tool',
        content: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        }),
      };
    }
  }

  async executeMultipleToolCalls(
    toolCalls: ToolCall[],
    context: Context,
  ): Promise<ToolCallResult[]> {
    const results = await Promise.allSettled(
      toolCalls.map((toolCall) => this.executeToolCall(toolCall, context)),
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
}

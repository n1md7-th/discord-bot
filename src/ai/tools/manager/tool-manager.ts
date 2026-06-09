import type { Context } from '@utils/context.ts';
import type { ToolCall, ToolCallResult, ToolExecutor } from '@ai/tools';
import type { ToolRegistry } from '@ai/tools';
import type { Tool, ToolDefinition } from '@ai/tools';

export class ToolManager {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly executor: ToolExecutor,
  ) {}

  registerTool(tool: Tool): void {
    this.registry.register(tool);
  }

  getToolDefinitions(): ToolDefinition[] {
    return this.registry.getToolDefinitions();
  }

  hasTools(): boolean {
    return this.registry.getAllTools().length > 0;
  }

  async executeMany(calls: ToolCall[], context: Context): Promise<ToolCallResult[]> {
    return await this.executor.executeMany(calls, context);
  }
}

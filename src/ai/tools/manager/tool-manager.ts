import type { Context } from '@utils/context.ts';
import type { ToolExecutor } from '../interfaces/tool-executor.interface.ts';
import type { ToolRegistry } from '../interfaces/tool-registry.interface.ts';
import type { ToolCall, ToolCallResult } from '../interfaces/tool-executor.interface.ts';
import type { Tool, ToolDefinition } from '../interfaces/tool.interface.ts';

export class ToolManager {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly executor: ToolExecutor,
  ) {}

  registerTool(tool: Tool): void {
    this.registry.register(tool);
  }

  unregisterTool(toolName: string): void {
    this.registry.unregister(toolName);
  }

  getToolDefinitions(): ToolDefinition[] {
    return this.registry.getToolDefinitions();
  }

  hasTools(): boolean {
    return this.registry.getAllTools().length > 0;
  }

  async executeToolCall(toolCall: ToolCall, context: Context): Promise<ToolCallResult> {
    return await this.executor.executeToolCall(toolCall, context);
  }

  async executeMultipleToolCalls(
    toolCalls: ToolCall[],
    context: Context,
  ): Promise<ToolCallResult[]> {
    return await this.executor.executeMultipleToolCalls(toolCalls, context);
  }

  getTool(toolName: string): Tool | null {
    return this.registry.getTool(toolName);
  }

  getAllTools(): Tool[] {
    return this.registry.getAllTools();
  }
}

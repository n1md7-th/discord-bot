import type { Tool, ToolDefinition } from '@ai/tools';

export interface ToolRegistry {
  register(tool: Tool): void;
  unregister(toolName: string): void;
  getTool(toolName: string): Tool | null;
  getAllTools(): Tool[];
  getToolDefinitions(): ToolDefinition[];
  hasToolByName(toolName: string): boolean;
}

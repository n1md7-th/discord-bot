import type { Tool, ToolDefinition } from '../interfaces/tool.interface.ts';
import type { ToolRegistry } from '../interfaces/tool-registry.interface.ts';

export class DefaultToolRegistry implements ToolRegistry {
  private readonly tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    const name = tool.getName();
    if (this.tools.has(name)) {
      throw new Error(`Tool with name '${name}' is already registered`);
    }
    this.tools.set(name, tool);
  }

  unregister(toolName: string): void {
    this.tools.delete(toolName);
  }

  getTool(toolName: string): Tool | null {
    return this.tools.get(toolName) || null;
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolDefinitions(): ToolDefinition[] {
    return this.getAllTools().map((tool) => tool.getDefinition());
  }

  hasToolByName(toolName: string): boolean {
    return this.tools.has(toolName);
  }
}

import type { Context } from '@utils/context.ts';
import type {
  Tool,
  ToolDefinition,
  ToolExecutionResult,
  ToolParameter,
} from '../interfaces/tool.interface.ts';

export abstract class AbstractTool implements Tool {
  abstract getName(): string;
  abstract getDescription(): string;
  abstract getParameters(): Record<string, ToolParameter>;
  abstract getRequiredParameters(): string[];

  protected abstract executeInternal(
    parameters: Record<string, any>,
    context: Context,
  ): Promise<ToolExecutionResult>;

  getDefinition(): ToolDefinition {
    return {
      name: this.getName(),
      description: this.getDescription(),
      parameters: {
        type: 'object',
        properties: this.getParameters(),
        required: this.getRequiredParameters(),
      },
    };
  }

  async execute(parameters: Record<string, any>, context: Context): Promise<ToolExecutionResult> {
    try {
      if (!this.validate(parameters)) {
        return {
          success: false,
          error: `Invalid parameters for tool ${this.getName()}`,
        };
      }

      context.logger.info(`Executing tool: ${this.getName()}`);
      const result = await this.executeInternal(parameters, context);
      context.logger.info(`Tool execution completed: ${this.getName()}`);

      return result;
    } catch (error) {
      context.logger.error(`Tool execution failed: ${this.getName()}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  validate(parameters: Record<string, any>): boolean {
    const required = this.getRequiredParameters();
    const provided = Object.keys(parameters);

    for (const param of required) {
      if (!provided.includes(param)) {
        return false;
      }
    }

    return this.validateParameterTypes(parameters);
  }

  private validateParameterTypes(parameters: Record<string, any>): boolean {
    const parameterDefs = this.getParameters();

    for (const [key, value] of Object.entries(parameters)) {
      const def = parameterDefs[key];
      if (!def) continue;

      if (!this.validateParameterType(value, def)) {
        return false;
      }
    }

    return true;
  }

  private validateParameterType(value: any, def: ToolParameter): boolean {
    switch (def.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }
}

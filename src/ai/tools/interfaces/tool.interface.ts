import type { Context } from '@utils/context.ts';

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
  properties?: Record<string, ToolParameter>;
  items?: ToolParameter;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface Tool {
  getName(): string;
  getDefinition(): ToolDefinition;
  execute(parameters: Record<string, any>, context: Context): Promise<ToolExecutionResult>;
  validate(parameters: Record<string, any>): boolean;
}

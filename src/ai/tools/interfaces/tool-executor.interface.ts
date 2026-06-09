import type { Context } from '@utils/context.ts';

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolCallResult {
  tool_call_id: string;
  role: 'tool';
  content: string;
}

export interface ToolExecutor {
  executeOne(call: ToolCall, context: Context): Promise<ToolCallResult>;
  executeMany(calls: ToolCall[], context: Context): Promise<ToolCallResult[]>;
}

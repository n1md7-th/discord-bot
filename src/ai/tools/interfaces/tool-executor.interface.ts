import type { Context } from '@utils/context.ts';
import type { ToolExecutionResult } from './tool.interface.ts';

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
  executeToolCall(toolCall: ToolCall, context: Context): Promise<ToolCallResult>;
  executeMultipleToolCalls(toolCalls: ToolCall[], context: Context): Promise<ToolCallResult[]>;
}

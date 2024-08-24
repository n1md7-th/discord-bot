import type { RoleEnum } from '../../db/enums/message.enum.ts';
import type { Context } from '../../utils/context.ts';
import { AiResponse } from '../response/ai.response.ts';

export abstract class Conversation {
  abstract isDisabled(): boolean;

  abstract disable(): void;

  abstract enable(): void;

  abstract increaseRequestsBy(value: number): void;

  abstract hasReachedLimit(): boolean;

  abstract addUserMessage(content: string): this;

  abstract sendRequest(context: Context, maxChunkSize?: number): Promise<AiResponse>;

  protected abstract addMessageBy(role: RoleEnum, content: string): this;

  addUserAttachment(url: string): this {
    throw new Error('Method:addUserAttachment not implemented.');
  }
}

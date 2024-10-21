import OpenAI from 'openai';
import { openAiApiKey } from '../../config';
import { RoleEnum } from '../../db/enums/message.enum.ts';
import type { ConversationsRepository } from '../../db/repositories/conversations.repository.ts';
import { type MessagesRepository } from '../../db/repositories/messages.repository.ts';
import { type Context } from '../../utils/context.ts';
import { Conversation } from '../abstract/abstract.conversation.ts';
import { AiResponse } from '../response/ai.response.ts';
import type { OpenAiMessage } from '../types/openai.ts';

export class OpenAiStrategy extends Conversation {
  private readonly openai: OpenAI;
  private readonly model = 'gpt-4o-mini';

  constructor(
    private readonly conversationId: string,
    private readonly conversations: ConversationsRepository,
    private readonly messages: MessagesRepository,
  ) {
    super();
    this.conversationId = conversationId;
    this.messages = messages;
    this.openai = new OpenAI({
      apiKey: openAiApiKey,
      maxRetries: 3,
      timeout: 15_000,
    });
  }

  /**
   * @param {Context} context
   * @param {number} [maxChunkSize = 2000] - The maximum size of each message chunk.
   * Since Discord has a limit of 2000 characters per message, this is the default value.
   */
  async sendRequest(context: Context, maxChunkSize: number = 2000) {
    try {
      context.logger.debug('Sending request to OpenAI');
      const conversation = await this.openai.chat.completions.create({
        model: this.model,
        messages: this.messages.getManyByConversationId(this.conversationId).map(
          (message) =>
            ({
              role: message.role,
              content: this.getFormattedContent(message.content),
            }) as OpenAiMessage,
        ),
      });
      context.logger.debug('Request received from OpenAI');

      const message = conversation.choices[0].message;

      const content = message.content || "I'm sorry, I don't understand.";

      this.addMessageBy(RoleEnum.Assistant, content);

      return new AiResponse(content, maxChunkSize);
    } catch (error) {
      context.logger.error('Error sending message:', error);
      return new AiResponse("I'm sorry, something went wrong.", maxChunkSize);
    }
  }

  override addUserMessage(content: string): this {
    this.addMessageBy(RoleEnum.User, content);

    return this;
  }

  override addUserAttachment(url: string): this {
    this.addAttachmentBy(RoleEnum.User, url);

    return this;
  }

  disable(): void {
    this.conversations.disable(this.conversationId);
  }

  enable(): void {
    this.conversations.enable(this.conversationId);
  }

  hasReachedLimit(): boolean {
    return this.conversations.hasReachedThreshold(this.conversationId);
  }

  increaseRequestsBy(value: number) {
    return this.conversations.increaseThreshold(this.conversationId, value);
  }

  isDisabled(): boolean {
    return this.conversations.isDisabled(this.conversationId);
  }

  protected addMessageBy(role: RoleEnum, content: string): this {
    this.conversations.increaseMessageCounter(this.conversationId);
    this.messages.create({
      conversationId: this.conversationId,
      role,
      content,
    });

    return this;
  }

  protected addAttachmentBy(role: RoleEnum, url: string): this {
    this.conversations.increaseMessageCounter(this.conversationId);
    this.messages.create({
      role,
      conversationId: this.conversationId,
      content: JSON.stringify([
        {
          type: 'image_url',
          image_url: {
            url,
            detail: 'low',
          },
        },
      ]),
    });

    return this;
  }

  private getFormattedContent(content: string) {
    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  }
}

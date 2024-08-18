import OpenAI from 'openai';
import { openAiApiKey } from '../../config';
import { Logger } from '../../utils/logger.ts';
import { Conversation } from '../abstract/abstract.conversation.ts';
import { AiResponse } from '../response/ai.response.ts';
import type { OpenAiMessage, OpenAiTemplate } from '../types/openai.ts';

export class OpenAiStrategy extends Conversation {
  private readonly openai: OpenAI;
  private readonly model = 'gpt-4o-mini';
  private readonly messages: OpenAiMessage[] = [];
  private readonly logger: Logger;

  constructor(template: OpenAiTemplate) {
    super(10);

    this.logger = new Logger('OpenAI');
    this.messages = template.getTemplate();
    this.openai = new OpenAI({
      apiKey: openAiApiKey,
      maxRetries: 3,
    });
  }

  /**
   * @param {number} [maxChunkSize = 2000] - The maximum size of each message chunk.
   * Since Discord has a limit of 2000 characters per message, this is the default value.
   */
  async sendRequest(maxChunkSize: number = 2000) {
    if (this.hasReachedLimit()) {
      return new AiResponse("I'm sorry, that is too many messages for this conversation.", maxChunkSize);
    }

    try {
      const conversation = await this.openai.chat.completions.create({
        model: this.model,
        messages: this.messages,
      });

      const message = conversation.choices[0].message;

      this.messages.push(message);

      return new AiResponse(message.content || "I'm sorry, I don't understand.", maxChunkSize);
    } catch (error) {
      this.logger.error('Error sending message:', error);
      return new AiResponse("I'm sorry, something went wrong.", maxChunkSize);
    }
  }

  override addUserMessage(content: string) {
    super.addUserMessage(content);

    this.messages.push({
      role: 'user',
      content,
    });

    return this;
  }
}

import type { Context } from '../utils/context.ts';
import { Conversation } from './abstract/abstract.conversation.ts';
import { OpenAiStrategy } from './strategies/openai.ts';
import { OpenAiTechBroTemplate } from './templates/openai/conversation.template.ts';
import { OpenAiGrammarlyTemplate } from './templates/openai/grammarly.template.ts';

export class Conversations {
  private readonly conversations: Map<string, Conversation>;

  constructor() {
    this.conversations = new Map();
  }

  get size() {
    return this.conversations.size;
  }

  getBy(id: string) {
    return this.conversations.get(id);
  }

  has(id: string) {
    return this.conversations.has(id);
  }

  deleteBy(id: string) {
    return this.conversations.delete(id);
  }

  createOpenAiGrammarlyConversationBy(id: string, context: Context) {
    const template = new OpenAiGrammarlyTemplate();
    const strategy = new OpenAiStrategy(template);

    return this.getOrCreateBy(id, strategy, context);
  }

  createOpenAiTechBroConversationBy(id: string, context: Context) {
    const template = new OpenAiTechBroTemplate();
    const strategy = new OpenAiStrategy(template);

    return this.getOrCreateBy(id, strategy, context);
  }

  private addBy(id: string, conversation: Conversation, context: Context) {
    this.conversations.set(id, conversation);

    context.logger.info(`Created conversation(${conversation.constructor.name}) for: ${id}`);

    return conversation;
  }

  private getOrCreateBy(id: string, conversation: Conversation, context: Context) {
    const existing = this.getBy(id);
    if (existing) return existing;

    return this.addBy(id, conversation, context);
  }
}

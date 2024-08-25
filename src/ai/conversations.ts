import type { DiscordBot } from '../bot/discord.bot.ts';
import type { ConversationsEntity } from '../db/entities/conversation.entity.ts';
import { StrategyEnum } from '../db/enums/conversation.enum.ts';
import type { Context } from '../utils/context.ts';
import type { Conversation } from './abstract/abstract.conversation.ts';
import type { AbstractCreator } from './abstract/abstract.creator.ts';
import { OpenAiConversationFactory } from './factory/open-ai-conversation.factory.ts';
import { OpenAiStrategy } from './strategies/openai.ts';

export class Conversations {
  private readonly openAiConversationFactory: AbstractCreator;

  constructor(private readonly bot: DiscordBot) {
    this.openAiConversationFactory = new OpenAiConversationFactory(this.bot);
  }

  existBy(id: string) {
    return this.bot.conversationRepository.getByPk(id) !== null;
  }

  getBy(id: string, context: Context) {
    context.logger.info(`Getting conversation by id ${id}`);
    const entity = this.bot.conversationRepository.getByPk(id);

    if (!entity) {
      context.logger.info(`Conversation not found by id ${id}`);
      return null;
    }

    context.logger.info(`Creating conversation by id ${id}`);

    return this.getInstanceBy(entity);
  }

  createGrammarlyBy(conversationId: string, context: Context) {
    context.logger.info(`Creating Grammarly conversation for ${conversationId}`);
    return this.openAiConversationFactory.createGrammarlyBy(conversationId);
  }

  createTechBroBy(conversationId: string, context: Context) {
    context.logger.info(`Creating TechBro conversation for ${conversationId}`);
    return this.openAiConversationFactory.createTechBroBy(conversationId);
  }

  createClarifyBy(conversationId: string, context: Context) {
    context.logger.info(`Creating Clarify conversation for ${conversationId}`);
    return this.openAiConversationFactory.createClarifyBy(conversationId);
  }

  private getInstanceBy(conversation: ConversationsEntity): Conversation {
    if (conversation.strategy === StrategyEnum.OpenAI) {
      return new OpenAiStrategy(conversation.id, this.bot.conversationRepository, this.bot.messagesRepository);
    }

    throw new Error(`Unsupported strategy ${conversation.strategy}`);
  }
}

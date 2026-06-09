import { ConversationsRepository } from '@db/repositories/conversations.repository.ts';
import { MessagesRepository } from '@db/repositories/messages.repository.ts';
import type { DiscordBot } from '../bot/discord.bot.ts';
import type { ConversationsEntity } from '../db/entities/conversation.entity.ts';
import { StrategyEnum, TemplateEnum } from '../db/enums/conversation.enum.ts';
import type { Context } from '../utils/context.ts';
import type { Conversation } from './abstract/abstract.conversation.ts';
import type { AbstractCreator } from './abstract/abstract.creator.ts';
import { OpenAiConversationFactory } from './factory/open-ai-conversation.factory.ts';
import { OpenAiStrategy, type StrategyMetadata } from './strategies/openai.ts';

export class Conversations {
  readonly conversationRepository: ConversationsRepository;
  readonly messagesRepository: MessagesRepository;
  private readonly openAiConversationFactory: AbstractCreator;

  constructor(private readonly bot: DiscordBot) {
    this.conversationRepository = new ConversationsRepository(bot.connection);
    this.messagesRepository = new MessagesRepository(bot.connection);
    this.openAiConversationFactory = new OpenAiConversationFactory(this.bot);
  }

  existBy(id: string) {
    return this.conversationRepository.getOneByPk(id) !== null;
  }

  getBy(id: string, context: Context) {
    context.logger.info(`Getting conversation by id ${id}`);
    const entity = this.conversationRepository.getOneByPk(id);

    if (!entity) {
      context.logger.info(`Conversation not found by id ${id}`);
      return null;
    }

    context.logger.info(`Creating conversation by id ${id}`);

    return this.getInstanceBy(entity, {
      useTools: entity.template === TemplateEnum.TechBro,
    });
  }

  createTranslateBy(conversationId: string, context: Context) {
    context.logger.info(`Creating Translate conversation for ${conversationId}`);
    return this.openAiConversationFactory.createTranslateBy(conversationId);
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

  private getInstanceBy(
    conversation: ConversationsEntity,
    metadata: StrategyMetadata,
  ): Conversation {
    if (conversation.strategy === StrategyEnum.OpenAI) {
      return new OpenAiStrategy(
        conversation.id,
        this.conversationRepository,
        this.messagesRepository,
        this.bot,
        metadata,
      );
    }

    throw new Error(`Unsupported strategy ${conversation.strategy}`);
  }
}

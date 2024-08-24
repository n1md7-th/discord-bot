import { StrategyEnum, TemplateEnum } from '../../db/enums/conversation.enum.ts';
import type { RoleEnum } from '../../db/enums/message.enum.ts';
import type { Conversation } from '../abstract/abstract.conversation.ts';
import { AbstractCreator } from '../abstract/abstract.creator.ts';
import { OpenAiStrategy } from '../strategies/openai.ts';
import { OpenAiClarifyTemplate } from '../templates/openai/clarify.template.ts';
import { OpenAiTechBroTemplate } from '../templates/openai/conversation.template.ts';
import { OpenAiGrammarlyTemplate } from '../templates/openai/grammarly.template.ts';

export class OpenAiConversationFactory extends AbstractCreator {
  createGrammarlyBy(conversationId: string): Conversation {
    const conversation = this.bot.conversationRepository.create({
      id: conversationId,
      template: TemplateEnum.Grammarly,
      strategy: StrategyEnum.OpenAI,
    });
    const template = new OpenAiGrammarlyTemplate();
    for (const message of template.getTemplate()) {
      this.bot.messagesRepository.create({
        conversationId: conversation.id,
        role: message.role as RoleEnum,
        content: message.content as string,
      });
    }

    return new OpenAiStrategy(conversation.id, this.bot.conversationRepository, this.bot.messagesRepository);
  }

  createTechBroBy(conversationId: string): Conversation {
    const conversation = this.bot.conversationRepository.create({
      id: conversationId,
      template: TemplateEnum.TechBro,
      strategy: StrategyEnum.OpenAI,
    });
    const template = new OpenAiTechBroTemplate();
    for (const message of template.getTemplate()) {
      this.bot.messagesRepository.create({
        conversationId: conversation.id,
        role: message.role as RoleEnum,
        content: message.content as string,
      });
    }

    return new OpenAiStrategy(conversation.id, this.bot.conversationRepository, this.bot.messagesRepository);
  }

  createClarifyBy(conversationId: string): Conversation {
    const conversation = this.bot.conversationRepository.create({
      id: conversationId,
      template: TemplateEnum.Clarify,
      strategy: StrategyEnum.OpenAI,
    });
    const template = new OpenAiClarifyTemplate();
    for (const message of template.getTemplate()) {
      this.bot.messagesRepository.create({
        conversationId: conversation.id,
        role: message.role as RoleEnum,
        content: message.content as string,
      });
    }

    return new OpenAiStrategy(conversation.id, this.bot.conversationRepository, this.bot.messagesRepository);
  }
}

import { OpenAiTranslateTemplate } from '@ai/templates/openai/translate.template.ts';
import { StrategyEnum, TemplateEnum } from '@db/enums/conversation.enum.ts';
import type { RoleEnum } from '@db/enums/message.enum.ts';
import { type Conversation } from '../abstract/abstract.conversation.ts';
import { AbstractCreator } from '../abstract/abstract.creator.ts';
import { OpenAiStrategy } from '../strategies/openai.ts';
import { OpenAiClarifyTemplate } from '../templates/openai/clarify.template.ts';
import { OpenAiTechBroTemplate } from '../templates/openai/conversation.template.ts';
import { OpenAiGrammarlyTemplate } from '../templates/openai/grammarly.template.ts';
import { ToolFactory } from '../tools/factory/tool-factory.ts';
import type { ToolManager } from '../tools/manager/tool-manager.ts';
import type { OpenAiMessage } from '../types/openai.ts';

export class OpenAiConversationFactory extends AbstractCreator {
  createGrammarlyBy(conversationId: string): Conversation {
    return this.createConversationWith(
      conversationId,
      TemplateEnum.Grammarly,
      new OpenAiGrammarlyTemplate(),
    );
  }

  override createTranslateBy(conversationId: string): Conversation {
    return this.createConversationWith(
      conversationId,
      TemplateEnum.Translate,
      new OpenAiTranslateTemplate(),
    );
  }

  createTechBroBy(conversationId: string): Conversation {
    const toolManager = ToolFactory.createDefaultToolManager();
    return this.createConversationWith(
      conversationId,
      TemplateEnum.TechBro,
      new OpenAiTechBroTemplate(),
      toolManager,
    );
  }

  createClarifyBy(conversationId: string): Conversation {
    return this.createConversationWith(
      conversationId,
      TemplateEnum.Clarify,
      new OpenAiClarifyTemplate(),
    );
  }

  private createConversationWith(
    conversationId: string,
    templateType: TemplateEnum,
    template: { getTemplate(): OpenAiMessage[] },
    toolManager?: ToolManager,
  ): Conversation {
    const conversation = this.bot.conversationRepository.create({
      id: conversationId,
      template: templateType,
      strategy: StrategyEnum.OpenAI,
    });

    // Batch insert messages for better performance
    const messages = template.getTemplate().map((message) => ({
      conversationId: conversation.id,
      role: message.role as RoleEnum,
      content: message.content as string,
    }));

    messages.forEach((message) => this.bot.messagesRepository.create(message));

    return new OpenAiStrategy(
      conversation.id,
      this.bot.conversationRepository,
      this.bot.messagesRepository,
      toolManager,
    );
  }
}

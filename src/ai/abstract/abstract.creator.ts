import type { DiscordBot } from '../../bot/discord.bot.ts';
import { Conversation } from './abstract.conversation.ts';

export abstract class AbstractCreator {
  constructor(protected readonly bot: DiscordBot) {}

  abstract createGrammarlyBy(conversationId: string): Conversation;

  abstract createTechBroBy(conversationId: string): Conversation;

  abstract createClarifyBy(conversationId: string): Conversation;
}

import type { Message, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { Logger, type LoggerOptions } from './logger.ts';

export class Context {
  readonly logger: Logger;
  readonly messageId: string;
  readonly channelId: string;

  constructor(options: Required<LoggerOptions>) {
    this.logger = new Logger(options);
    this.messageId = options.messageId;
    this.channelId = options.channelId;
  }

  static fromMessage(message: Message) {
    return new Context({
      messageId: message.id,
      channelId: message.channel.id,
      label: message.author.username,
    });
  }

  static fromReaction(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    return new Context({
      messageId: reaction.message.id,
      channelId: reaction.message.channel.id,
      label: user.username || '<Unknown User>',
    });
  }
}

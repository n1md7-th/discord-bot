import type { Message } from 'discord.js';
import { MessageCommand } from '../../abstract/message.command.ts';

export class ExtendCommand extends MessageCommand {
  async execute(message: Message<boolean>) {
    this.bot.logger.info('!Extend command invoked');

    const conversation = this.bot.conversations.getBy(message.channelId);

    if (conversation) {
      conversation.increaseRequestsBy(5);
    }

    this.bot.logger.info('!Extend command executed');
  }
}

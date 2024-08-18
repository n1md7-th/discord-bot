import type { Message } from 'discord.js';
import { MessageCommand } from '../abstract/message.command.ts';

export class EnableCommand extends MessageCommand {
  async execute(message: Message<boolean>) {
    this.bot.logger.info('!Enable command invoked');

    const conversation = this.bot.conversations.getBy(message.channelId);

    if (conversation) {
      conversation.enable();
    }

    this.bot.logger.info('!Enable command executed');
  }
}

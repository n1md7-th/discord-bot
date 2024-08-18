import type { Message } from 'discord.js';
import { MessageCommand } from '../abstract/message.command.ts';

export class DisableCommand extends MessageCommand {
  async execute(message: Message<boolean>) {
    this.bot.logger.info('!Disable command invoked');

    const conversation = this.bot.conversations.getBy(message.channelId);

    if (conversation) {
      conversation.disable();
    }

    this.bot.logger.info('!Disable command executed');
  }
}

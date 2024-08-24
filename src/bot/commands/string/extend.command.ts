import type { Message } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { MessageCommand } from '../../abstract/message.command.ts';
import { StringCommand } from '../../enums/command.enum.ts';

export class ExtendCommand extends MessageCommand {
  async execute(message: Message<boolean>, context: Context) {
    this.bot.logger.info('!Extend command invoked');

    const conversation = this.bot.conversations.getBy(message.channelId, context);

    if (conversation) {
      conversation.increaseRequestsBy(5);
    }

    this.bot.logger.info('!Extend command executed');
  }

  override removeCommandPrefix(message: string): string {
    return message.replace(StringCommand.Extend, '').trim();
  }
}

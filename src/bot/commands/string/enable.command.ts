import type { Message } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { MessageCommand } from '../../abstract/message.command.ts';
import { StringCommand } from '../../enums/command.enum.ts';

export class EnableCommand extends MessageCommand {
  async execute(message: Message<boolean>, context: Context) {
    this.bot.logger.info('!Enable command invoked');

    const conversation = this.bot.conversations.getBy(message.channelId, context);

    if (conversation) {
      conversation.enable();
    }

    this.bot.logger.info('!Enable command executed');
  }

  override removeCommandPrefix(message: string): string {
    return message.replace(StringCommand.Enable, '').trim();
  }
}

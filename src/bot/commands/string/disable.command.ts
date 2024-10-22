import type { Message } from 'discord.js';
import type { Context } from '@utils/context.ts';
import { MessageCommandHandler } from '../../abstract/handlers/message.command.ts';
import { StringCommandEnum } from '../../enums/command.enum.ts';

export class DisableCommand extends MessageCommandHandler {
  async execute(message: Message<boolean>, context: Context) {
    this.bot.logger.info('!Disable command invoked');

    const conversation = this.bot.conversations.getBy(message.channelId, context);

    if (conversation) {
      conversation.disable();
    }

    this.bot.logger.info('!Disable command executed');
  }

  override removeCommandPrefix(message: string): string {
    return message.replace(StringCommandEnum.Disable, '').trim();
  }
}

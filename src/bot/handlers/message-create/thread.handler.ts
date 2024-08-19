import type { Context } from '../../../utils/context.ts';
import { CreateHandler } from '../../abstract/create.handler.ts';
import type { Message } from 'discord.js';

export class ThreadHandler extends CreateHandler {
  async handle(message: Message, context: Context) {
    context.logger.info('Thread handler invoked');

    const command = this.bot.stringCommands.getByMessage(message.content);

    if (command) {
      await command.execute(message);
    }

    const threadConversation = this.bot.conversations.getBy(message.channelId);
    if (threadConversation) {
      if (threadConversation.isDisabled()) return;

      await message.channel.sendTyping();
      const response = await threadConversation
        .addUserMessage(message.content)
        .sendRequest(context, this.bot.messageLimit);

      context.logger.info(
        `ResponseSize: ${response.size}. Limit: ${this.bot.messageLimit}. Chunks: ${response.chunks.length}.`,
      );

      for (const chunk of response.chunks) {
        await message.channel.send(chunk);
      }
    }

    context.logger.info('Thread handler executed');
  }
}

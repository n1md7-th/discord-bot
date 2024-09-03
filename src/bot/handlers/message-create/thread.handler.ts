import type { Message } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { CreateHandler } from '../../abstract/handlers/create.handler.ts';

export class ThreadHandler extends CreateHandler {
  private readonly thresholdReachedMessage = "I'm sorry, that is too many messages for this conversation.";

  async handle(message: Message, context: Context) {
    context.logger.info('Thread handler invoked');

    let content = message.content;

    const command = this.bot.stringCommands.getByMessage(message.content);

    if (command) {
      await command.execute(message, context);
      content = command.removeCommandPrefix(content);
    }

    if (content.length === 0) return;

    const threadConversation = this.bot.conversations.getBy(message.channelId, context);
    if (threadConversation) {
      if (threadConversation.isDisabled()) return;
      if (threadConversation.hasReachedLimit()) {
        return await message.channel.send(this.thresholdReachedMessage);
      }

      await message.channel.sendTyping();
      const response = await threadConversation.addUserMessage(content).sendRequest(context, this.bot.messageLimit);

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

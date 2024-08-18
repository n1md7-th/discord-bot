import { CreateHandler } from '../../abstract/create.handler.ts';
import type { Message } from 'discord.js';

export class ThreadHandler extends CreateHandler {
  async handle(message: Message) {
    this.bot.logger.info('Thread handler invoked');

    const command = this.bot.commands.getByMessagePrefix(message.content);

    if (command) {
      await command.execute(message);
    }

    const threadConversation = this.bot.conversations.getBy(message.channelId);
    if (threadConversation) {
      if (threadConversation.isDisabled()) return;

      await message.channel.sendTyping();
      const response = await threadConversation.addUserMessage(message.content).sendRequest(this.bot.messageLimit);

      this.bot.logger.info(
        `ResponseSize: ${response.size}. Limit: ${this.bot.messageLimit}. Chunks: ${response.chunks.length}.`,
      );

      for (const chunk of response.chunks) {
        await message.channel.send(chunk);
      }
    }

    this.bot.logger.info('Thread handler executed');
  }
}

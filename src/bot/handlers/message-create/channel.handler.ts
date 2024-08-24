import { type AnyThreadChannel, type Message, ThreadAutoArchiveDuration } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { Randomizer } from '../../../utils/randomizer.ts';
import { CreateHandler } from '../../abstract/create.handler.ts';

export class ChannelHandler extends CreateHandler {
  private readonly emojis = new Randomizer(['📱', '💻', '🖥️', '🦾', '👋', '👀', '🙃', '👻']);

  async handle(message: Message, context: Context) {
    context.logger.info('Channel handler invoked');

    if (this.isBotMentioned(message)) {
      context.logger.info('Bot mentioned in the message');

      await message.react(this.emojis.getRandom());
      await message.react(this.emojis.getRandom());
      await message.react(this.emojis.getRandom());

      const thread = await this.createThread(message);
      const conversation = this.createConversation(message, thread, context);
      const response = await conversation.sendRequest(context, this.bot.messageLimit);

      context.logger.info(
        `ResponseSize: ${response.size}. Limit: ${this.bot.messageLimit}. Chunks: ${response.chunks.length}.`,
      );

      for (const message of response.chunks) {
        await thread.send(message);
      }
    }

    context.logger.info('Channel handler executed');
  }

  private isBotMentioned(message: Message) {
    const isMentionedOne = message.mentions.users.has(this.bot.id);
    const isMentionedTwo = message.content.startsWith(this.bot.slug);

    return isMentionedOne || isMentionedTwo;
  }

  private async createThread(message: Message) {
    return await message.startThread({
      name: this.bot.techBroThreadName.next().value,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: 'User requested a tech support',
    });
  }

  private createConversation(message: Message, thread: AnyThreadChannel, context: Context) {
    return this.bot.conversations.createTechBroBy(thread.id, context).addUserMessage(message.content);
  }
}

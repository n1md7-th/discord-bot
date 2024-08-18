import { type AnyThreadChannel, type Message, ThreadAutoArchiveDuration } from 'discord.js';
import { Randomizer } from '../../../utils/randomizer.ts';
import { CreateHandler } from '../../abstract/create.handler.ts';

export class ChannelHandler extends CreateHandler {
  private readonly emojis = new Randomizer(['📱', '💻', '🖥️', '🦾', '👋', '👀', '🙃', '👻']);

  async handle(message: Message) {
    this.bot.logger.info('Channel handler invoked');

    if (this.isBotMentioned(message)) {
      this.bot.logger.info('Bot mentioned in the message');

      await message.react(this.emojis.getRandom());
      await message.react(this.emojis.getRandom());
      await message.react(this.emojis.getRandom());

      const thread = await this.createThread(message);
      const conversation = this.createConversation(message, thread);
      const response = await conversation.sendRequest(this.bot.messageLimit);

      this.bot.logger.info(
        `ResponseSize: ${response.size}. Limit: ${this.bot.messageLimit}. Chunks: ${response.chunks.length}.`,
      );

      for (const message of response.chunks) {
        await thread.send(message);
      }
    }

    this.bot.logger.info('Channel handler executed');
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

  private createConversation(message: Message, thread: AnyThreadChannel) {
    const conversation = this.bot.conversations.createOpenAiTechBroConversationBy(thread.id);
    conversation.addUserMessage(message.content);

    return conversation;
  }
}

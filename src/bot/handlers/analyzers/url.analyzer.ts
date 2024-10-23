import { type Message } from 'discord.js';
import type { Context } from '@utils/context.ts';
import { CreateHandler } from '@bot/abstract/handlers/create.handler.ts';
import * as emoji from 'node-emoji';

export class UrlAnalyzer extends CreateHandler {
  async handle(message: Message, context: Context): Promise<void> {
    if (!this.bot.services.analyzer.hasUrl(message.content)) return;

    context.logger.info('Url analyzer invoked');

    await message.react('👀');

    const sanitizedContent = await this.bot.services.analyzer.removeTrackers(message.content);

    if (!this.bot.services.analyzer.isSameContent(message.content, sanitizedContent)) {
      await message.react('👀'); // Revoke the previous reaction
    }

    if (!message.deletable) return context.logger.warn('No permission. Skipping the deletion of the message.');

    const newMessage = await this.replayAsUser(message, sanitizedContent, context).catch((error) => {
      context.logger.error('Failed to replay as webhook user', error);

      return this.replayAsBot(message, sanitizedContent);
    });

    await message.delete();

    await this.applyReactions(newMessage);

    context.logger.info('Url analyzer cleaned up the urls');
    context.logger.info('Url analyzer executed');
  }

  private async replayAsUser(message: Message, content: string, context: Context) {
    const webhook = await this.bot.services.webhook.getHookBy(message, context);

    return await webhook.send(content);
  }

  private async replayAsBot(message: Message, content: string) {
    return await message.reply(content);
  }

  private async applyReactions(message: Message) {
    await message.react('👀');
    await message.react(emoji.emojify(':sponge:'));
    await message.react(emoji.emojify(':soap:'));
    await message.react(emoji.emojify(':bubbles:'));
    await message.react(emoji.emojify(':white_circle:'));
  }
}

import {
  MessageReaction,
  ThreadAutoArchiveDuration,
  type AnyThreadChannel,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js';
import type { Context } from '@utils/context.ts';
import { Randomizer } from '@utils/randomizer.ts';
import { ReactionCommandHandler } from '@bot/abstract/handlers/reaction.command.ts';
import { BotException } from '@bot/exceptions/bot.exception.ts';

export class GrammarlyCommand extends ReactionCommandHandler {
  private readonly emojis = new Randomizer(['📖', '📚', '📝', '📓', '📔', '📒', '📕', '📗', '📘', '💬']);

  async execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, context: Context) {
    context.logger.info('Grammarly command invoked');

    if (reaction.message.content === null) return;
    if (reaction.message.hasThread) return;
    if (reaction.message.thread?.id) return;
    if (reaction.message.author?.bot) return;

    await reaction.message.channel.sendTyping();

    context.logger.debug('Reacting to the message...');
    await reaction.message.react(this.emojis.getRandom());
    context.logger.debug('Message reacted');

    const thread = await this.createThread(reaction);

    context.logger.info(`Thread created: #${thread.id} - ${thread.name}`);

    const conversation = this.createConversation(reaction, thread, context);
    const response = await conversation.sendRequest(context, this.bot.messageLimit);

    context.logger.info(
      `ResponseSize: ${response.size}. Limit: ${this.bot.messageLimit}. Chunks: ${response.chunks.length}.`,
    );

    // When the size of the response exceeds the limit, the response is split into chunks.
    for (const message of response.chunks) {
      await thread.send(message);
    }

    context.logger.info('Grammarly command executed');
  }

  private async createThread(reaction: MessageReaction | PartialMessageReaction) {
    return await reaction.message
      .startThread({
        name: this.bot.grammarlyThreadName.next().value,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
        reason: 'User requested a correction',
      })
      .catch((exception) => {
        throw new BotException({
          exception,
          message: 'I could not create a thread here. Perhaps it is not allowed 😕',
          channelId: reaction.message.channelId,
          messageId: reaction.message.id,
        });
      });
  }

  private createConversation(
    reaction: MessageReaction | PartialMessageReaction,
    thread: AnyThreadChannel<boolean>,
    context: Context,
  ) {
    return this.bot.conversations.createGrammarlyBy(thread.id, context).addUserMessage(reaction.message.content!);
  }
}

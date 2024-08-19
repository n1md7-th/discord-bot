import {
  MessageReaction,
  ThreadAutoArchiveDuration,
  type AnyThreadChannel,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js';
import type { Context } from '../../utils/context.ts';
import { Randomizer } from '../../utils/randomizer.ts';
import { ReactionCommand } from '../abstract/reaction.command.ts';

export class GrammarlyCommand extends ReactionCommand {
  private readonly emojis = new Randomizer(['📖', '📚', '📝', '📓', '📔', '📒', '📕', '📗', '📘', '💬']);

  async execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, context: Context) {
    context.logger.info('Grammarly command invoked');

    if (reaction.message.content === null) return;
    if (reaction.message.hasThread) return;
    if (reaction.message.author?.bot) return;

    await reaction.message.channel.sendTyping();

    await reaction.message.react(this.emojis.getRandom());
    await reaction.message.react(this.emojis.getRandom());
    await reaction.message.react(this.emojis.getRandom());

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
    return await reaction.message.startThread({
      name: this.bot.grammarlyThreadName.next().value,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: 'User requested a correction',
    });
  }

  private createConversation(
    reaction: MessageReaction | PartialMessageReaction,
    thread: AnyThreadChannel<boolean>,
    context: Context,
  ) {
    const conversation = this.bot.conversations.createOpenAiGrammarlyConversationBy(thread.id, context);
    conversation.addUserMessage(reaction.message.content!);

    return conversation;
  }
}

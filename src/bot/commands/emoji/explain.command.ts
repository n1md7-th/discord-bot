import { MessageReaction, type PartialMessageReaction, type PartialUser, type User } from 'discord.js';
import type { Context } from '@utils/context.ts';
import { ReactionCommandHandler } from '@bot/abstract/handlers/reaction.command.ts';

export class ExplainCommand extends ReactionCommandHandler {
  async execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, context: Context) {
    context.logger.debug('Clarify command invoked');

    const { content, attachments, channel } = reaction.message;

    if (reaction.message.author?.bot) return;
    if (!content && !attachments.size) return;
    if (this.bot.conversations.existBy(reaction.message.id)) return;

    await channel.sendTyping();
    await reaction.message.react('💬');

    const conversation = this.bot.conversations.createClarifyBy(reaction.message.id, context);

    if (content) conversation.addUserMessage(content);
    if (attachments.size) {
      attachments.forEach((attachment) => conversation.addUserAttachment(attachment.url));
    }
    const response = await conversation.sendRequest(context, this.bot.messageLimit);

    for (const message of response.chunks) {
      await channel.send({
        content: message,
        reply: {
          messageReference: reaction.message.id,
        },
      });
    }

    context.logger.debug('Clarify command executed');
  }
}

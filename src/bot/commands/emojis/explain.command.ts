import { MessageReaction, type PartialMessageReaction, type PartialUser, type User } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { ReactionCommand } from '../../abstract/reaction.command.ts';

export class ExplainCommand extends ReactionCommand {
  async execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, context: Context) {
    context.logger.info('Clarify command invoked');

    const { content, attachments, channel } = reaction.message;

    if (reaction.message.author?.bot) return;
    if (!content && !attachments.size) return;
    if (this.bot.conversations.getBy(reaction.message.id, context)) return;

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

    context.logger.info('Clarify command executed');
  }
}

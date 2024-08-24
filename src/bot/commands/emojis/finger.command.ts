import { MessageReaction, type PartialMessageReaction, type PartialUser, type User } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { Randomizer } from '../../../utils/randomizer.ts';
import { ReactionCommand } from '../../abstract/reaction.command.ts';

export class FingerCommand extends ReactionCommand {
  private readonly emojis = new Randomizer(['🖕', '🤬', '🤨', '😤', '😡', '😠', '😖']);

  async execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser, context: Context) {
    context.logger.info('Disrespect command invoked');

    await user.send(this.emojis.getRandom());
    await user.send('Shame on you!');

    context.logger.info('Disrespect command executed');
  }
}

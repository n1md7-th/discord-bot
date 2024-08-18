import type { MessageCommand } from '../abstract/message.command.ts';
import type { ReactionCommand } from '../abstract/reaction.command.ts';
import { GuildEmoji, type ReactionEmoji } from 'discord.js';
import { Trie } from '../../utils/prefix.tree.ts';
import { DiscordBot } from '../discord.bot.ts';
import { DisableCommand } from './disable.command.ts';
import { EnableCommand } from './enable.command.ts';
import { ExtendCommand } from './extend.command.ts';
import { GrammarlyCommand } from './grammarly.command.ts';

export class ReactionCommandService {
  private readonly commands: Trie<ReactionCommand | MessageCommand>;

  constructor(bot: DiscordBot) {
    this.commands = new Trie();

    this.commands.set('📖', new GrammarlyCommand(bot));
    this.commands.set('!extend', new ExtendCommand(bot));
    this.commands.set('!enable', new EnableCommand(bot));
    this.commands.set('!disable', new DisableCommand(bot));
  }

  getByEmoji(emoji: GuildEmoji | ReactionEmoji) {
    if (!emoji.name) return;

    return this.commands.get(emoji.name) as ReactionCommand;
  }

  getByMessagePrefix(prefix: string) {
    const command = this.commands.get(prefix);

    if (!command) return;

    return command as MessageCommand;
  }
}

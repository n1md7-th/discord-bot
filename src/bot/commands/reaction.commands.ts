import { GuildEmoji, type ReactionEmoji } from 'discord.js';
import type { ReactionCommand } from '../abstract/reaction.command.ts';
import { DiscordBot } from '../discord.bot.ts';
import { EmojiCommand } from '../enums/command.enum.ts';
import { ExplainCommand } from './emojis/explain.command.ts';
import { FingerCommand } from './emojis/finger.command.ts';
import { GrammarlyCommand } from './emojis/grammarly.command.ts';

export class ReactionCommands {
  private readonly commands: Map<EmojiCommand, ReactionCommand>;

  constructor(bot: DiscordBot) {
    this.commands = new Map();

    this.commands.set(EmojiCommand.Grammarly, new GrammarlyCommand(bot));
    this.commands.set(EmojiCommand.Finger, new FingerCommand(bot));
    this.commands.set(EmojiCommand.Explain, new ExplainCommand(bot));
  }

  getByEmoji(emoji: GuildEmoji | ReactionEmoji) {
    if (!emoji.name) return;

    return this.commands.get(<EmojiCommand>emoji.name) as ReactionCommand;
  }
}

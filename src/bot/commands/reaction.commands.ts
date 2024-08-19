import type { ReactionCommand } from '../abstract/reaction.command.ts';
import { EmojiCommand } from '../enums/command.enum.ts';
import { GuildEmoji, type ReactionEmoji } from 'discord.js';
import { DiscordBot } from '../discord.bot.ts';
import { GrammarlyCommand } from './grammarly.command.ts';

export class ReactionCommands {
  private readonly commands: Map<EmojiCommand, ReactionCommand>;

  constructor(bot: DiscordBot) {
    this.commands = new Map();

    this.commands.set(EmojiCommand.Grammarly, new GrammarlyCommand(bot));
  }

  getByEmoji(emoji: GuildEmoji | ReactionEmoji) {
    if (!emoji.name) return;

    return this.commands.get(<EmojiCommand>emoji.name) as ReactionCommand;
  }
}

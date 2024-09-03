import { GuildEmoji, type ReactionEmoji } from 'discord.js';
import type { ReactionCommandHandler } from '../abstract/handlers/reaction.command.ts';
import { DiscordBot } from '../discord.bot.ts';
import { EmojiCommandEnum } from '../enums/command.enum.ts';
import { ExplainCommand } from './emoji/explain.command.ts';
import { FingerCommand } from './emoji/finger.command.ts';
import { GrammarlyCommand } from './emoji/grammarly.command.ts';

export class ReactionCommands {
  private readonly commands: Map<EmojiCommandEnum, ReactionCommandHandler>;

  constructor(bot: DiscordBot) {
    this.commands = new Map();

    this.commands.set(EmojiCommandEnum.Grammarly, new GrammarlyCommand(bot));
    this.commands.set(EmojiCommandEnum.Finger, new FingerCommand(bot));
    this.commands.set(EmojiCommandEnum.Explain, new ExplainCommand(bot));
  }

  getByEmoji(emoji: GuildEmoji | ReactionEmoji) {
    if (!emoji.name) return;

    return this.commands.get(<EmojiCommandEnum>emoji.name) as ReactionCommandHandler;
  }
}

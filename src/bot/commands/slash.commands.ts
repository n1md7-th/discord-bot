import type { SlashCommandHandler } from '../abstract/handlers/slash.command.ts';
import type { DiscordBot } from '../discord.bot.ts';
import { SlashCommandEnum } from '../enums/command.enum.ts';
import { PingCommand } from './slash/ping.command.ts';

export class SlashCommands {
  private readonly commands: Map<string, SlashCommandHandler>;

  constructor(bot: DiscordBot) {
    this.commands = new Map();

    this.commands.set(SlashCommandEnum.Ping, new PingCommand(bot));
  }

  getByName(name: string) {
    return this.commands.get(name);
  }

  toREST() {
    return Array.from(this.commands.values()).map((command) => command.register().toJSON());
  }
}

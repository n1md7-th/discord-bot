import { SanitizeCommand } from '@bot/commands/slash/sanitize.command.ts';
import { SayCommand } from '@bot/commands/slash/say.command.ts';
import { ScheduleCommand } from '@bot/commands/slash/schedule.command.ts';
import { TranslateCommand } from '@bot/commands/slash/translate.command.ts';
import type { SlashCommandHandler } from '../abstract/handlers/slash.command.ts';
import type { DiscordBot } from '../discord.bot.ts';
import { SlashCommandEnum } from '../enums/command.enum.ts';
import { IpCommand } from './slash/ip.command.ts';
import { PingCommand } from './slash/ping.command.ts';
import { Pm2Command } from './slash/pm2/pm2.command.ts';

export class SlashCommands {
  private readonly commands: Map<string, SlashCommandHandler>;

  constructor(bot: DiscordBot) {
    this.commands = new Map();

    this.commands.set(SlashCommandEnum.Ping, new PingCommand(bot));
    this.commands.set(SlashCommandEnum.IP, new IpCommand(bot));
    this.commands.set(SlashCommandEnum.PM2, new Pm2Command(bot));
    this.commands.set(SlashCommandEnum.Sanitize, new SanitizeCommand(bot));
    this.commands.set(SlashCommandEnum.Translate, new TranslateCommand(bot));
    this.commands.set(SlashCommandEnum.Say, new SayCommand(bot));
    this.commands.set(SlashCommandEnum.Schedule, new ScheduleCommand(bot));
  }

  getByName(name: string) {
    return this.commands.get(name);
  }

  toREST() {
    return Array.from(this.commands.values()).map((command) => command.register().toJSON());
  }
}

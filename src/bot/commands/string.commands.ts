import type { MessageCommand } from '../abstract/message.command.ts';
import { DiscordBot } from '../discord.bot.ts';
import { StringCommand } from '../enums/command.enum.ts';
import { DisableCommand } from './string/disable.command.ts';
import { EnableCommand } from './string/enable.command.ts';
import { ExtendCommand } from './string/extend.command.ts';

export class StringCommands {
  private readonly extend: MessageCommand;
  private readonly enable: MessageCommand;
  private readonly disable: MessageCommand;

  constructor(bot: DiscordBot) {
    this.extend = new ExtendCommand(bot);
    this.enable = new EnableCommand(bot);
    this.disable = new DisableCommand(bot);
  }

  getByMessage(message: string) {
    if (message.startsWith(StringCommand.Extend)) return this.extend;
    if (message.startsWith(StringCommand.Enable)) return this.enable;
    if (message.startsWith(StringCommand.Disable)) return this.disable;

    return;
  }
}

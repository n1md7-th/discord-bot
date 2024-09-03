import type { MessageCommandHandler } from '../abstract/handlers/message.command.ts';
import { DiscordBot } from '../discord.bot.ts';
import { StringCommandEnum } from '../enums/command.enum.ts';
import { DisableCommand } from './string/disable.command.ts';
import { EnableCommand } from './string/enable.command.ts';
import { ExtendCommand } from './string/extend.command.ts';

export class StringCommands {
  private readonly extend: MessageCommandHandler;
  private readonly enable: MessageCommandHandler;
  private readonly disable: MessageCommandHandler;

  constructor(bot: DiscordBot) {
    this.extend = new ExtendCommand(bot);
    this.enable = new EnableCommand(bot);
    this.disable = new DisableCommand(bot);
  }

  getByMessage(message: string) {
    if (message.startsWith(StringCommandEnum.Extend)) return this.extend;
    if (message.startsWith(StringCommandEnum.Enable)) return this.enable;
    if (message.startsWith(StringCommandEnum.Disable)) return this.disable;
  }
}

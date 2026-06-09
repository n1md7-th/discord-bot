import {
  CancelScheduleMessageTool,
  CreateScheduleMessageTool,
  DefaultToolExecutor,
  DefaultToolRegistry,
  GetGlobalIpTool,
  GetLocalIpTool,
  GetScheduledMessagesTool,
  ToolManager,
} from '@ai/tools';
import type { DiscordBot } from '@bot/discord.bot.ts';

export class ToolFactory {
  static createDefaultToolManager(bot: DiscordBot): ToolManager {
    const registry = new DefaultToolRegistry();
    const executor = new DefaultToolExecutor(registry);
    const manager = new ToolManager(registry, executor);

    manager.registerTool(new GetLocalIpTool(bot));
    manager.registerTool(new GetGlobalIpTool(bot));
    manager.registerTool(new CreateScheduleMessageTool(bot));
    manager.registerTool(new CancelScheduleMessageTool(bot));
    manager.registerTool(new GetScheduledMessagesTool(bot));

    return manager;
  }
}

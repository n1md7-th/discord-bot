import { DefaultToolExecutor } from '../executor/tool-executor.ts';
import { GetGlobalIpTool } from '../implementations/get-global-ip.tool.ts';
import { GetLocalIpTool } from '../implementations/get-local-ip.tool.ts';
import { ToolManager } from '../manager/tool-manager.ts';
import { DefaultToolRegistry } from '../registry/tool-registry.ts';

export class ToolFactory {
  static createDefaultToolManager(): ToolManager {
    const registry = new DefaultToolRegistry();
    const executor = new DefaultToolExecutor(registry);
    const manager = new ToolManager(registry, executor);

    manager.registerTool(new GetLocalIpTool());
    manager.registerTool(new GetGlobalIpTool());

    return manager;
  }
}

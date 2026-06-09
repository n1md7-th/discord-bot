import type { ToolExecutionResult, ToolParameter } from '@ai/tools';
import { AbstractTool } from '@ai/tools';
import type { Context } from '@utils/context.ts';
import { networkInterfaces } from 'os';

export class GetLocalIpTool extends AbstractTool {
  getName(): string {
    return 'get_local_ip';
  }

  getDescription(): string {
    return 'Gets the local IP address(es) of the server. Returns all non-internal IPv4 addresses.';
  }

  getParameters(): Record<string, ToolParameter> {
    return {};
  }

  getRequiredParameters(): string[] {
    return [];
  }

  protected async executeInternal(
    parameters: Record<string, any>,
    context: Context,
  ): Promise<ToolExecutionResult> {
    try {
      const localIps = Object.values(networkInterfaces())
        .flat()
        .reduce((ips, iface) => {
          if (!iface) return ips;
          if (iface.family !== 'IPv4') return ips;
          if (iface.internal) return ips;

          ips.push(iface.address);
          return ips;
        }, [] as string[]);

      if (localIps.length === 0) {
        return {
          success: false,
          error: 'No local IP addresses found',
        };
      }

      return {
        success: true,
        data: {
          ips: localIps,
          primary: localIps[0],
          all: localIps.join(', '),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get local IP address',
      };
    }
  }
}

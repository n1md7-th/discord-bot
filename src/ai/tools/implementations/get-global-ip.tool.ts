import type { Context } from '@utils/context.ts';
import { AbstractTool } from '@ai/tools';
import type { ToolExecutionResult, ToolParameter } from '@ai/tools';

export class GetGlobalIpTool extends AbstractTool {
  getName(): string {
    return 'get_global_ip';
  }

  getDescription(): string {
    return 'Gets the global/external IP address of the server by querying external services.';
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
      const ip = await this.getGlobalIp(context);

      if (!ip || ip.includes('Unable to get IP')) {
        return {
          success: false,
          error: 'Failed to retrieve global IP address from external services',
        };
      }

      return {
        success: true,
        data: {
          ip,
          source: 'external_services',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get global IP address',
      };
    }
  }

  private async getGlobalIp(context: Context): Promise<string> {
    return await Promise.allSettled([this.getFromIfconfig(), this.getFromIpify()]).then(
      (results) => {
        for (const result of results) {
          if (result.status === 'fulfilled') {
            return result.value;
          }
          context.logger.error('Failed to get IP address', result.reason);
        }
        return 'Unable to get IP address from any service';
      },
    );
  }

  private async getFromIfconfig(): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://ifconfig.me/ip', {
        signal: controller.signal,
        headers: { 'User-Agent': 'Discord-Bot/1.0' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async getFromIpify(): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: controller.signal,
        headers: { 'User-Agent': 'Discord-Bot/1.0' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.ip;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

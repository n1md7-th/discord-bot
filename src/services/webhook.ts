import type { Context } from '@utils/context.ts';
import {
  type Channel,
  type ChannelWebhookCreateOptions,
  type Collection,
  type Message,
  type Snowflake,
  type Webhook,
} from 'discord.js';

// It is missing in the Discord.js typings
export type ChannelWebhook = Channel & {
  fetchWebhooks: () => Promise<Webhook[]>;
  createWebhook: (options: ChannelWebhookCreateOptions) => Promise<Webhook>;
  editWebhook: (webhook: Webhook, options: { name: string; avatar?: string; reason?: string }) => Promise<Webhook>;
};

export class WebhookService {
  private readonly hooks: Record<Snowflake, Record<string, Webhook>> = {};

  async getHookBy(message: Message, context: Context): Promise<Webhook> {
    const channel = message.channel as ChannelWebhook;

    this.hooks[channel.url] ||= {};

    const hookId = message.author.displayName;

    // 1st try to get the hook from the cache
    if (this.hooks[channel.url][hookId]) {
      context.logger.info(`Found a cached Webhook for ${message.author.displayName}`);

      return this.hooks[channel.url][hookId];
    }

    context.logger.info(`No cached Webhook for ${message.author.displayName}`);
    context.logger.info(`Fetching Webhooks for ${channel.url}`);

    const hooks = await this.fetchHooks(channel);
    this.hooks[channel.url] = hooks.reduce(
      (acc, hook) => {
        acc[hook.name] = hook;

        return acc;
      },
      {} as Record<string, Webhook>,
    );

    // 2nd try to get the hook
    if (this.hooks[channel.url][hookId]) {
      context.logger.info(`Found a Webhook for ${message.author.displayName} after fetching`);

      return this.hooks[channel.url][hookId];
    }

    context.logger.info(`Still no Webhook for ${message.author.displayName}, creating a new one...`);

    return await channel
      .createWebhook({
        name: message.author.displayName,
        avatar: message.author.displayAvatarURL(),
        reason: 'Needed a cool new Webhook to impersonate the user',
      })
      .then((hook) => {
        this.hooks[channel.url][hook.name] = hook;

        context.logger.info(`A new Webhook for ${message.author.displayName} successfully created`);

        return hook;
      });
  }

  private async fetchHooks(channel: ChannelWebhook) {
    return (await channel.fetchWebhooks()) as Awaited<Collection<Snowflake, Webhook>>;
  }
}

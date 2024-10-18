import {
  type Channel,
  type ChannelWebhookCreateOptions,
  type Collection,
  type Message,
  type Snowflake,
  type Webhook,
} from 'discord.js';
import type { Context } from '@utils/context.ts';

// It is missing in the Discord.js typings
export type ChannelWebhook = Channel & {
  fetchWebhooks: () => Promise<Webhook[]>;
  createWebhook: (options: ChannelWebhookCreateOptions) => Promise<Webhook>;
  editWebhook: (webhook: Webhook, options: { name: string; avatar?: string; reason?: string }) => Promise<Webhook>;
};

export class WebhookService {
  private readonly hooks = new Map<Snowflake, Webhook>();

  constructor() {
    this.cacheHooksByName = this.cacheHooksByName.bind(this);
  }

  async getHookBy(message: Message, context: Context): Promise<Webhook> {
    const channel = message.channel as ChannelWebhook;

    // 1st try to get the hook from the cache
    if (this.hooks.has(message.author.displayName)) {
      context.logger.info(`Found a cached Webhook for ${message.author.displayName}`);

      return this.hooks.get(message.author.displayName)!;
    }

    context.logger.info(`No cached Webhook for ${message.author.displayName}`);
    context.logger.info(`Fetching Webhooks for ${channel.url}`);

    await this.fetchHooks(channel).then(this.cacheHooksByName);

    // 2nd try to get the hook
    if (this.hooks.has(message.author.displayName)) {
      context.logger.info(`Found a Webhook for ${message.author.displayName} after fetching`);

      return this.hooks.get(message.author.displayName)!;
    }

    context.logger.info(`Still no Webhook for ${message.author.displayName}, creating a new one...`);
    return await channel
      .createWebhook({
        name: message.author.displayName,
        avatar: message.author.displayAvatarURL(),
        reason: 'Needed a cool new Webhook to impersonate the user',
      })
      .then((hook) => {
        this.hooks.set(message.author.displayName, hook);

        context.logger.info(`A new Webhook for ${message.author.displayName} successfully created`);

        return hook;
      });
  }

  private async fetchHooks(channel: ChannelWebhook) {
    return (await channel.fetchWebhooks()) as Awaited<Collection<Snowflake, Webhook>>;
  }

  private cacheHooksByName(hooks: Collection<Snowflake, Webhook>) {
    hooks.forEach((hook) => this.hooks.set(hook.name, hook));
  }
}

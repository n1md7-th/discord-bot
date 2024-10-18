import type { Context } from '@utils/context.ts';
import {
  type Channel,
  type ChannelWebhookCreateOptions,
  type Collection,
  type Message,
  type Snowflake,
  type User,
  type Webhook,
} from 'discord.js';

// It is missing in the Discord.js typings
export type ChannelWebhook = Channel & {
  fetchWebhooks: () => Promise<Webhook[]>;
  createWebhook: (options: ChannelWebhookCreateOptions) => Promise<Webhook>;
  editWebhook: (webhook: Webhook, options: { name: string; avatar?: string; reason?: string }) => Promise<Webhook>;
};

export class WebhookService {
  private readonly hooks = new Map<Snowflake, Webhook>();

  async getHookBy(message: Message, context: Context): Promise<Webhook> {
    const channel = message.channel as ChannelWebhook;
    const hookId = this.getIdBy(channel, message.author);

    // 1st try to get the hook from the cache
    if (this.hooks.has(hookId)) {
      context.logger.info(`Found a cached Webhook for ${message.author.displayName}`);

      return this.hooks.get(hookId)!;
    }

    context.logger.info(`No cached Webhook for ${message.author.displayName}`);
    context.logger.info(`Fetching Webhooks for ${channel.url}`);

    await this.fetchHooks(channel).then((hooks) => {
      return this.cacheHooksByName(hooks, channel, message.author);
    });

    // 2nd try to get the hook
    if (this.hooks.has(hookId)) {
      context.logger.info(`Found a Webhook for ${message.author.displayName} after fetching`);

      return this.hooks.get(hookId)!;
    }

    context.logger.info(`Still no Webhook for ${message.author.displayName}, creating a new one...`);
    return await channel
      .createWebhook({
        name: message.author.displayName,
        avatar: message.author.displayAvatarURL(),
        reason: 'Needed a cool new Webhook to impersonate the user',
      })
      .then((hook) => {
        this.hooks.set(hookId, hook);

        context.logger.info(`A new Webhook for ${message.author.displayName} successfully created`);

        return hook;
      });
  }

  private async fetchHooks(channel: ChannelWebhook) {
    return (await channel.fetchWebhooks()) as Awaited<Collection<Snowflake, Webhook>>;
  }

  private cacheHooksByName(hooks: Collection<Snowflake, Webhook>, channel: ChannelWebhook, author: User) {
    hooks.forEach((hook) => this.hooks.set(this.getIdBy(channel, author), hook));
  }

  private getIdBy(channel: ChannelWebhook, author: User) {
    return `${channel.id}-${author.id}`;
  }
}

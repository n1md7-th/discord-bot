import { Conversations } from '@ai/conversations.ts';
import { CreateHandler } from '@bot/abstract/handlers/create.handler.ts';
import { ReactionCommands } from '@bot/commands/reaction.commands.ts';
import { SlashCommands } from '@bot/commands/slash.commands.ts';
import { StringCommands } from '@bot/commands/string.commands.ts';
import { BotException } from '@bot/exceptions/bot.exception.ts';
import { UrlAnalyzer } from '@bot/handlers/analyzers/url.analyzer.ts';
import { ChannelHandler } from '@bot/handlers/message-create/channel.handler.ts';
import { HelpHandler } from '@bot/handlers/message-create/help.handler.ts';
import { ThreadHandler } from '@bot/handlers/message-create/thread.handler.ts';
import { ConversationsRepository } from '@db/repositories/conversations.repository.ts';
import { MessagesRepository } from '@db/repositories/messages.repository.ts';
import { UrlAnalyzerService } from '@services/analyzer.service.ts';
import { SchedulerService } from '@services/scheduler.service.ts';
import { UnicodeService } from '@services/unicode.service.ts';
import { WebhookService } from '@services/webhook.service.ts';
import { Context } from '@utils/context.ts';
import { Logger } from '@utils/logger.ts';
import { NameMaker } from '@utils/name.maker.ts';
import { type Database, SQLiteError } from 'bun:sqlite';
import chalk from 'chalk';
import {
  ActivityType,
  type AutocompleteInteraction,
  type CacheType,
  type ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  type Interaction,
  type Message,
  MessageReaction,
  type PartialMessage,
  type PartialMessageReaction,
  Partials,
  type PartialUser,
  type User,
} from 'discord.js';
import * as emoji from 'node-emoji';

export class DiscordBot {
  readonly messageLimit = 2000;
  readonly nameMaker = new NameMaker();

  readonly grammarlyThreadName: Generator<string>;
  readonly techBroThreadName: Generator<string>;

  readonly conversations: Conversations;
  readonly schedules: SchedulerService;

  readonly reactionCommands: ReactionCommands;
  readonly stringCommands: StringCommands;
  readonly slashCommands: SlashCommands;

  readonly client: Client;

  readonly handlers: Record<'thread' | 'channel' | 'help' | 'urlSanitizer', CreateHandler>;

  readonly conversationRepository: ConversationsRepository;
  readonly messagesRepository: MessagesRepository;

  id!: string;
  tag!: string;
  slug!: string;
  username!: string;

  readonly services: {
    unicode: UnicodeService;
    analyzer: UrlAnalyzerService;
    webhook: WebhookService;
  };

  constructor(
    readonly logger: Logger,
    readonly connection: Database,
  ) {
    this.conversationRepository = new ConversationsRepository(connection);
    this.messagesRepository = new MessagesRepository(connection);
    this.conversations = new Conversations(this);
    this.schedules = new SchedulerService(this);
    this.reactionCommands = new ReactionCommands(this);
    this.stringCommands = new StringCommands(this);
    this.slashCommands = new SlashCommands(this);
    this.grammarlyThreadName = this.nameMaker.makeThreadName('Grammarly');
    this.techBroThreadName = this.nameMaker.makeThreadName('Tech Bro');
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildWebhooks,
      ],
      partials: [
        Partials.User,
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.ThreadMember,
      ],
    });
    this.handlers = {
      thread: new ThreadHandler(this),
      channel: new ChannelHandler(this),
      help: new HelpHandler(this),
      urlSanitizer: new UrlAnalyzer(this),
    };
    this.services = {
      unicode: new UnicodeService(),
      analyzer: new UrlAnalyzerService(),
      webhook: new WebhookService(),
    };

    this.onError = this.onError.bind(this);
    this.onClientReady = this.onClientReady.bind(this);
    this.onMessageCreate = this.onMessageCreate.bind(this);
    this.onMessageUpdate = this.onMessageUpdate.bind(this);
    this.onMessageDelete = this.onMessageDelete.bind(this);
    this.onInteractionCreate = this.onInteractionCreate.bind(this);
    this.onMessageReactionAdd = this.onMessageReactionAdd.bind(this);
    this.onMessageReactionRemove = this.onMessageReactionRemove.bind(this);
  }

  subscribe() {
    this.client.once(Events.ClientReady, this.onClientReady);

    this.client.on(Events.Error, this.onError);
    this.client.on(Events.MessageCreate, this.onMessageCreate);
    this.client.on(Events.MessageReactionAdd, this.onMessageReactionAdd);
    this.client.on(Events.InteractionCreate, this.onInteractionCreate);
    this.client.on(Events.MessageUpdate, this.onMessageUpdate);
    this.client.on(Events.MessageDelete, this.onMessageDelete);
    this.client.on(Events.MessageReactionRemove, this.onMessageReactionRemove);
    this.client.on(Events.GuildMemberAvailable, (member) => {
      this.logger.info(`Member Available: ${member.user.tag}`);
    });

    return this;
  }

  unsubscribe() {
    this.client.removeAllListeners();
  }

  async login(token: string) {
    await this.client.login(token);
  }

  async sendDm(userId: string, text: string) {
    const user = await this.client.users.fetch(userId);

    return await user.send(text);
  }

  async sendChannel(channelId: string, text: string) {
    const channel = await this.client.channels.fetch(channelId);

    if (channel && 'send' in channel) return await channel.send(text);

    return this.logger.error('Channel is not a text channel to send a message');
  }

  async sendThread(threadId: string, text: string) {
    const thread = await this.client.channels.fetch(threadId);

    if (!thread || !thread.isThread()) {
      return this.logger.error('Thread not found or not a thread');
    }

    return await thread.send(text);
  }

  private async onClientReady(client: Client<true>) {
    this.logger.info('Bot is ready 🤖');
    this.logger.info(`Ready to interact`);
    this.logger.info(`Logged in as Tag:${client.user.tag}`);
    this.logger.info(`Logged in as Username:${client.user.username}`);

    this.id = client.user.id;
    this.tag = client.user.tag;
    this.username = client.user.username;
    this.slug = `Hey ${client.user.username}`;
    client.user.setStatus('online');
    client.user.setActivity('grammar & your GF', {
      type: ActivityType.Watching,
    });
  }

  private async onMessageCreate(message: Message) {
    const context = Context.fromMessage(message);

    const messages = [chalk.blueBright(`[SENT]`)];
    if (message.attachments.size)
      messages.push(`${chalk.blueBright(`[ATTACHMENTS ${message.attachments.size}]`)}`);
    context.logger.info(
      messages.join(':') + `: ${this.services.unicode.toNormalized(message.content)}`,
    );

    if (message.author.bot) return;

    try {
      await this.handlers.urlSanitizer.handle(message, context);

      if (message.content.startsWith('!help')) {
        return await this.handlers.help.handle(message, context);
      }

      if (message.channel.isThread()) {
        if (message.content.startsWith('!skip')) return;

        return await this.handlers.thread.handle(message, context);
      }

      return await this.handlers.channel.handle(message, context);
    } catch (error) {
      if (error instanceof BotException) {
        await this.notifyChannel(message, error);
      }
    }
  }

  private onMessageUpdate(
    oldMessage: Message<boolean> | PartialMessage,
    newMessage: Message<boolean> | PartialMessage,
  ) {
    const context = Context.fromMessage(newMessage);

    context.logger.info(
      `${chalk.cyanBright('[UPDATED]')}: ${this.services.unicode.highlightedDifference(oldMessage.content, newMessage.content)}`,
    );
  }

  private onMessageDelete(message: Message<boolean> | PartialMessage) {
    const context = Context.fromMessage(message);

    context.logger.info(
      `${chalk.redBright('[DELETED]')}: ${chalk.strikethrough(this.services.unicode.toNormalized(message.content))}`,
    );
  }

  private async onMessageReactionAdd(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ) {
    const context = Context.fromReaction(reaction, user);
    context.logger.info(
      `${chalk.blueBright('[REACTED]')}: ${emoji.unemojify(reaction.emoji.name || '🐾')}`,
    );

    if (user.bot) return;

    try {
      const command = this.reactionCommands.getByEmoji(reaction.emoji);

      if (command) {
        await command.execute(reaction, user, context);
      }
    } catch (error) {
      if (error instanceof BotException) {
        await this.notifyChannel(reaction.message, error);
      }
    }
  }

  private onMessageReactionRemove(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ) {
    const context = Context.fromReaction(reaction, user);
    context.logger.info(
      `${chalk.redBright('[UNREACTED]')}: ${emoji.unemojify(reaction.emoji.name || '🐾')}`,
    );
  }

  private async onInteractionCreate(interaction: Interaction<CacheType>) {
    const context = Context.fromInteraction(interaction);

    if (interaction.isChatInputCommand()) {
      return await this.handleInputCommand(interaction, context);
    }

    if (interaction.isAutocomplete()) {
      return await this.handleAutocomplete(interaction, context);
    }
  }

  private async handleInputCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
    context: Context,
  ) {
    const command = this.slashCommands.getByName(interaction.commandName);

    context.logger.info(`Slash command received: ${interaction.commandName}`);

    try {
      await command.execute(interaction, context);
    } catch (error) {
      context.logger.error('Slash command error:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  }

  private async handleAutocomplete(
    interaction: AutocompleteInteraction<CacheType>,
    context: Context,
  ) {
    const command = this.slashCommands.getByName(interaction.commandName);

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      context.logger.error('Autocomplete error:', error);
      await interaction.respond([]);
    }
  }

  private async notifyChannel(message: Message<boolean> | PartialMessage, error: BotException) {
    this.logger.error('Bot Exception:', error.getErrorMessage(), error.getPrivateMessage());
    message.channel.send(error.getErrorMessage()).catch(this.logger.error);
  }

  private onError(error: Error) {
    if (error instanceof SQLiteError) {
      return this.logger.error('SQLite Error:', error);
    }

    this.logger.error('Error:', error);
  }
}

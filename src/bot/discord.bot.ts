import { type Database, SQLiteError } from 'bun:sqlite';
import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  MessageReaction,
  type CacheType,
  type Interaction,
  type Message,
  type PartialMessage,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js';
import { Conversations } from '@ai/conversations.ts';
import { ConversationsRepository } from '@db/repositories/conversations.repository.ts';
import { MessagesRepository } from '@db/repositories/messages.repository.ts';
import { Context } from '@utils/context.ts';
import { Logger } from '@utils/logger.ts';
import { NameMaker } from '@utils/name.maker.ts';
import { UnicodeUtils } from '@utils/unicode.utils.ts';
import { CreateHandler } from '@bot/abstract/handlers/create.handler.ts';
import { ReactionCommands } from '@bot/commands/reaction.commands.ts';
import { SlashCommands } from '@bot/commands/slash.commands.ts';
import { StringCommands } from '@bot/commands/string.commands.ts';
import { BotException } from '@bot/exceptions/bot.exception.ts';
import { UrlAnalyzer } from '@bot/handlers/analyzers/url.analyzer.ts';
import { ChannelHandler } from '@bot/handlers/message-create/channel.handler.ts';
import { HelpHandler } from '@bot/handlers/message-create/help.handler.ts';
import { ThreadHandler } from '@bot/handlers/message-create/thread.handler.ts';

export class DiscordBot {
  readonly messageLimit = 2000;
  readonly nameMaker = new NameMaker();

  readonly grammarlyThreadName: Generator<string>;
  readonly techBroThreadName: Generator<string>;

  readonly conversations: Conversations;

  readonly reactionCommands: ReactionCommands;
  readonly stringCommands: StringCommands;
  readonly slashCommands: SlashCommands;

  readonly client: Client;

  readonly handlers: {
    thread: CreateHandler;
    channel: CreateHandler;
    help: CreateHandler;
    urlSanitizer: CreateHandler;
  };

  readonly conversationRepository: ConversationsRepository;
  readonly messagesRepository: MessagesRepository;

  id!: string;
  tag!: string;
  slug!: string;
  username!: string;

  readonly unicodeUtils: UnicodeUtils;

  constructor(
    readonly logger: Logger,
    readonly connection: Database,
  ) {
    this.conversationRepository = new ConversationsRepository(connection);
    this.messagesRepository = new MessagesRepository(connection);
    this.conversations = new Conversations(this);
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
    });
    this.handlers = {
      thread: new ThreadHandler(this),
      channel: new ChannelHandler(this),
      help: new HelpHandler(this),
      urlSanitizer: new UrlAnalyzer(this),
    };
    this.unicodeUtils = new UnicodeUtils();

    this.onError = this.onError.bind(this);
    this.onClientReady = this.onClientReady.bind(this);
    this.onMessageCreate = this.onMessageCreate.bind(this);
    this.onMessageUpdate = this.onMessageUpdate.bind(this);
    this.onMessageDelete = this.onMessageDelete.bind(this);
    this.onInteractionCreate = this.onInteractionCreate.bind(this);
    this.onMessageReactionAdd = this.onMessageReactionAdd.bind(this);
  }

  subscribe() {
    this.client.once(Events.ClientReady, this.onClientReady);

    this.client.on(Events.Error, this.onError);
    this.client.on(Events.MessageCreate, this.onMessageCreate);
    this.client.on(Events.MessageReactionAdd, this.onMessageReactionAdd);
    this.client.on(Events.InteractionCreate, this.onInteractionCreate);
    this.client.on(Events.MessageUpdate, this.onMessageUpdate);
    this.client.on(Events.MessageDelete, this.onMessageDelete);

    return this;
  }

  unsubscribe() {
    this.client.removeAllListeners();
  }

  async login(token: string) {
    await this.client.login(token);
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
    if (message.author.bot) return;

    const context = Context.fromMessage(message);

    context.logger.info(`Message received: ${this.unicodeUtils.toAscii(message.content)}`);
    if (message.attachments.size) {
      context.logger.info(`With Attachments of ${message.attachments.size}`);
    }

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
    if (oldMessage.author?.bot) return;

    const context = Context.fromMessage(newMessage);

    context.logger.info(`Message updated: ${this.unicodeUtils.toAscii(newMessage.content)}`);
  }

  private onMessageDelete(message: Message<boolean> | PartialMessage) {
    if (message.author?.bot) return;

    const context = Context.fromMessage(message);

    context.logger.info(`Message deleted: ${this.unicodeUtils.toAscii(message.content)}`);
  }

  private async onMessageReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    if (user.bot) return;

    const context = Context.fromReaction(reaction, user);

    context.logger.info(`Reaction added: ${reaction.emoji.name}`);

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

  private async onInteractionCreate(interaction: Interaction<CacheType>) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.slashCommands.getByName(interaction.commandName);
    if (!command) return;

    const context = Context.fromInteraction(interaction);

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

  private async notifyChannel(message: Message<boolean> | PartialMessage, error: BotException) {
    await this.client.channels.fetch(message.channelId).then(async (channel) => {
      if (channel?.isSendable()) {
        this.logger.error('Bot Exception:', error.getErrorMessage(), error.getPrivateMessage());
        await channel.send(error.getErrorMessage()).catch(this.logger.error);
      }
    });
  }

  private onError(error: Error) {
    if (error instanceof SQLiteError) {
      return this.logger.error('SQLite Error:', error);
    }

    this.logger.error('Error:', error);
  }
}

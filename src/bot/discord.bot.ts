import { type Database, SQLiteError } from 'bun:sqlite';
import {
  ActivityType,
  type CacheType,
  Client,
  Events,
  GatewayIntentBits,
  type Interaction,
  type Message,
  MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js';
import { Conversations } from '../ai/conversations.ts';
import { ConversationsRepository } from '../db/repositories/conversations.repository.ts';
import { MessagesRepository } from '../db/repositories/messages.repository.ts';
import { Context } from '../utils/context.ts';
import { Logger } from '../utils/logger.ts';
import { NameMaker } from '../utils/name.maker.ts';
import { CreateHandler } from './abstract/handlers/create.handler.ts';
import { ReactionCommands } from './commands/reaction.commands.ts';
import { SlashCommands } from './commands/slash.commands.ts';
import { StringCommands } from './commands/string.commands.ts';
import { BotException } from './exceptions/bot.exception.ts';
import { UrlAnalyzer } from './handlers/analyzers/url.analyzer.ts';
import { ChannelHandler } from './handlers/message-create/channel.handler.ts';
import { HelpHandler } from './handlers/message-create/help.handler.ts';
import { ThreadHandler } from './handlers/message-create/thread.handler.ts';

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
      ],
    });
    this.handlers = {
      thread: new ThreadHandler(this),
      channel: new ChannelHandler(this),
      help: new HelpHandler(this),
      urlSanitizer: new UrlAnalyzer(this),
    };

    this.onError = this.onError.bind(this);
    this.onClientReady = this.onClientReady.bind(this);
    this.onMessageCreate = this.onMessageCreate.bind(this);
    this.onInteractionCreate = this.onInteractionCreate.bind(this);
    this.onMessageReactionAdd = this.onMessageReactionAdd.bind(this);
  }

  subscribe() {
    this.client.once(Events.ClientReady, this.onClientReady);

    this.client.on(Events.Error, this.onError);
    this.client.on(Events.MessageCreate, this.onMessageCreate);
    this.client.on(Events.MessageReactionAdd, this.onMessageReactionAdd);
    this.client.on(Events.InteractionCreate, this.onInteractionCreate);

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

    context.logger.info(`Message received: ${message.content}`);

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
        await message.channel.send(error.getErrorMessage()).catch(this.logger.error);
        this.logger.error('Bot Exception:', error.getErrorMessage(), error.getPrivateMessage());
      }
    }
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
        await reaction.message.channel.send(error.getErrorMessage()).catch(this.logger.error);
        this.logger.error('Bot Exception:', error.getErrorMessage(), error.getPrivateMessage());
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

  private onError(error: Error) {
    if (error instanceof SQLiteError) {
      return this.logger.error('SQLite Error:', error);
    }

    this.logger.error('Error:', error);
  }
}

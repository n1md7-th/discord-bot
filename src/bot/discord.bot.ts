import {
  ActivityType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Message,
  MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from 'discord.js';
import { Conversations } from '../ai/conversations.ts';
import { Logger } from '../utils/logger.ts';
import { NameMaker } from '../utils/name.maker.ts';
import { CreateHandler } from './abstract/create.handler.ts';
import { ReactionCommandService } from './commands/reaction-command.service.ts';
import { ChannelHandler } from './handlers/message-create/channel.handler.ts';
import { HelpHandler } from './handlers/message-create/help.handler.ts';
import { ThreadHandler } from './handlers/message-create/thread.handler.ts';

export class DiscordBot {
  readonly messageLimit = 2000;
  readonly nameMaker = new NameMaker();
  readonly grammarlyThreadName: Generator<string>;
  readonly techBroThreadName: Generator<string>;
  readonly conversations: Conversations;
  readonly commands: ReactionCommandService;
  readonly logger: Logger;
  readonly client: Client;
  readonly createHandlers: {
    thread: CreateHandler;
    channel: CreateHandler;
    help: CreateHandler;
  };

  id!: string;
  tag!: string;
  slug!: string;
  username!: string;

  constructor(logger: Logger) {
    this.logger = logger;
    this.commands = new ReactionCommandService(this);
    this.conversations = new Conversations(this.logger);
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
    this.createHandlers = {
      thread: new ThreadHandler(this),
      channel: new ChannelHandler(this),
      help: new HelpHandler(this),
    };

    this.onError = this.onError.bind(this);
    this.onClientReady = this.onClientReady.bind(this);
    this.onMessageCreate = this.onMessageCreate.bind(this);
    this.onMessageReactionAdd = this.onMessageReactionAdd.bind(this);
  }

  subscribe() {
    this.client.on(Events.Error, this.onError);
    this.client.once(Events.ClientReady, this.onClientReady);
    this.client.on(Events.MessageCreate, this.onMessageCreate);
    this.client.on(Events.MessageReactionAdd, this.onMessageReactionAdd);

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

    this.logger.info(`[${message.author.username}]: ${message.content}`);

    if (message.content.startsWith('!help')) {
      return await this.createHandlers.help.handle(message);
    }

    if (message.channel.isThread()) {
      if (message.content.startsWith('!skip')) return;

      return await this.createHandlers.thread.handle(message);
    }

    return await this.createHandlers.channel.handle(message);
  }

  private async onMessageReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    if (user.bot) return;

    this.logger.info(`Reaction added: ${reaction.emoji.name} by ${user.username}`);

    const command = this.commands.getByEmoji(reaction.emoji);

    if (command) {
      await command.execute(reaction, user);
    }
  }

  private onError(error: Error) {
    this.logger.error('Error:', error);
  }
}

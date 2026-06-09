import type { DiscordBot } from '@bot/discord.bot.ts';
import OpenAI from 'openai';
import { openAiApiKey } from '../../config';
import { RoleEnum } from '@db/enums/message.enum.ts';
import type { ConversationsRepository } from '@db/repositories/conversations.repository.ts';
import { type MessagesRepository } from '@db/repositories/messages.repository.ts';
import { type Context } from '@utils/context.ts';
import { Conversation } from '../abstract/abstract.conversation.ts';
import { AiResponse } from '../response/ai.response.ts';
import { type ToolCall, ToolFactory, ToolManager } from '@ai/tools';

export type StrategyMetadata = {
  useTools: boolean;
};

export class OpenAiStrategy extends Conversation {
  private readonly openai: OpenAI;
  private readonly model = 'gpt-4o-mini';
  private readonly tools: ToolManager;

  constructor(
    private readonly conversationId: string,
    private readonly conversations: ConversationsRepository,
    private readonly messages: MessagesRepository,
    private readonly bot: DiscordBot,
    private readonly metadata: StrategyMetadata = { useTools: false },
  ) {
    super();
    this.openai = new OpenAI({
      apiKey: openAiApiKey,
      maxRetries: 3,
      timeout: 15_000,
    });
    this.tools = ToolFactory.createDefaultToolManager(this.bot);
  }

  /**
   * @param {Context} context
   * @param {number} [maxChunkSize = 2000] - The maximum size of each message chunk.
   * Since Discord has a limit of 2000 characters per message, this is the default value.
   */
  async sendRequest(context: Context, maxChunkSize: number = 2000) {
    try {
      context.logger.info('Sending request to OpenAI');

      const requestParams: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
        model: this.model,
        messages: this.buildMessagesForOpenAI(),
      };

      if (this.metadata.useTools && this.tools.hasTools()) {
        requestParams.tools = this.tools.getToolDefinitions().map((def) => ({
          type: 'function',
          function: def,
        }));
        requestParams.tool_choice = 'auto';
      }

      const completion = await this.openai.chat.completions.create(requestParams);
      context.logger.info('Request received from OpenAI');

      const message = completion.choices[0].message;

      if (message.tool_calls && this.metadata.useTools) {
        return await this.handleToolCalls(
          { ...message, tool_calls: message.tool_calls },
          context,
          maxChunkSize,
        );
      }

      const content = message.content || "I'm sorry, I don't understand.";
      this.addMessageBy(RoleEnum.Assistant, content);

      return new AiResponse(content, maxChunkSize);
    } catch (error) {
      context.logger.error('Error sending message:', error);
      return new AiResponse("I'm sorry, something went wrong.", maxChunkSize);
    }
  }

  override addSystemMessage(content: string): this {
    this.addMessageBy(RoleEnum.System, content);

    return this;
  }

  override addUserMessage(content: string): this {
    this.addMessageBy(RoleEnum.User, content);

    return this;
  }

  override addUserAttachment(url: string): this {
    this.addAttachmentBy(RoleEnum.User, url);

    return this;
  }

  disable(): void {
    this.conversations.disable(this.conversationId);
  }

  enable(): void {
    this.conversations.enable(this.conversationId);
  }

  hasReachedLimit(): boolean {
    return this.conversations.hasReachedThreshold(this.conversationId);
  }

  increaseRequestsBy(value: number): void {
    this.conversations.increaseThreshold(this.conversationId, value);
  }

  isDisabled(): boolean {
    return this.conversations.isDisabled(this.conversationId);
  }

  protected addMessageBy(role: RoleEnum, content: string): this {
    this.conversations.increaseMessageCounter(this.conversationId);
    this.messages.create({
      conversationId: this.conversationId,
      role,
      content,
    });

    return this;
  }

  protected addAttachmentBy(role: RoleEnum, url: string): this {
    this.conversations.increaseMessageCounter(this.conversationId);
    this.messages.create({
      role,
      conversationId: this.conversationId,
      content: JSON.stringify([
        {
          type: 'image_url',
          image_url: {
            url,
            detail: 'low',
          },
        },
      ]),
    });

    return this;
  }

  private async handleToolCalls(
    message: OpenAI.Chat.Completions.ChatCompletionMessage & {
      tool_calls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
    },
    context: Context,
    maxChunkSize: number,
  ): Promise<AiResponse> {
    context.logger.info(`Processing ${message.tool_calls.length} tool calls`);

    const requestedCalls = message.tool_calls.map(
      (tc) =>
        ({
          id: tc.id,
          type: tc.type,
          function: tc.function,
        }) as ToolCall,
    );

    const toolResults = await this.tools.executeMany(requestedCalls, context);

    // Build the messages array for the follow-up request
    const existingMessages = this.messages.getManyByConversationId(this.conversationId).map(
      (msg) =>
        ({
          role: msg.role,
          content: this.getFormattedContent(msg.content),
        }) as OpenAI.Chat.Completions.ChatCompletionMessageParam,
    );

    // Add the assistant message with tool calls
    const assistantMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'assistant',
      content: message.content,
      tool_calls: message.tool_calls,
    };

    // Add tool result messages
    const toolMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = toolResults.map(
      (result) => ({
        role: 'tool',
        tool_call_id: result.tool_call_id,
        content: result.content,
      }),
    );

    const allMessages = [...existingMessages, assistantMessage, ...toolMessages];

    const followUpParams: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model: this.model,
      messages: allMessages,
    };

    const followUpCompletion = await this.openai.chat.completions.create(followUpParams);
    const followUpMessage = followUpCompletion.choices[0].message;
    const content = followUpMessage.content || "I've completed the requested actions.";

    // Store all the messages in the database
    this.addMessageBy(
      RoleEnum.Assistant,
      JSON.stringify({
        content: message.content,
        tool_calls: message.tool_calls,
      }),
    );

    for (const result of toolResults) {
      this.addMessageBy(RoleEnum.Tool, JSON.stringify(result));
    }

    this.addMessageBy(RoleEnum.Assistant, content);

    return new AiResponse(content, maxChunkSize);
  }

  private buildMessagesForOpenAI(): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const dbMessages = this.messages.getManyByConversationId(this.conversationId);
    const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    for (const msg of dbMessages) {
      if (msg.role === 'tool') {
        // Tool messages are stored as JSON, parse and format for OpenAI
        try {
          const toolResult = JSON.parse(msg.content);
          openAIMessages.push({
            role: 'tool',
            tool_call_id: toolResult.tool_call_id,
            content: JSON.stringify(toolResult.content),
          });
        } catch (e) {
          // Skip malformed tool messages
          continue;
        }
      } else if (msg.role === 'assistant') {
        // Check if this is a tool call message (stored as JSON)
        try {
          const assistantData = JSON.parse(msg.content);
          if (assistantData.tool_calls) {
            openAIMessages.push({
              role: 'assistant',
              content: assistantData.content || null,
              tool_calls: assistantData.tool_calls,
            });
          } else {
            // Regular assistant message
            openAIMessages.push({
              role: 'assistant',
              content: msg.content,
            });
          }
        } catch (e) {
          // Regular assistant message (not JSON)
          openAIMessages.push({
            role: 'assistant',
            content: msg.content,
          });
        }
      } else {
        // System, user messages - check if they need JSON parsing (like attachments)
        const content = this.getFormattedContent(msg.content);
        openAIMessages.push({
          role: msg.role,
          content: content,
        } as OpenAI.Chat.Completions.ChatCompletionMessageParam);
      }
    }

    return openAIMessages;
  }

  private getFormattedContent(content: string) {
    try {
      return JSON.parse(content);
    } catch (e) {
      return content;
    }
  }
}

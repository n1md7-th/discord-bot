const { env } = import.meta;

export const token = env.DISCORD_TOKEN;
export const openAiApiKey = env.OPENAI_API_KEY;
export const username = env.DISCORD_BOT_USERNAME;
export const nodeEnv = env.NODE_ENV;
export const isProduction = nodeEnv === 'production';

if (!token) throw new Error('Discord token is not provided');
if (!openAiApiKey) throw new Error('OpenAI API key is not provided');

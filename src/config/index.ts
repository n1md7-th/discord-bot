const { env } = import.meta;

export const token = env.DISCORD_TOKEN;
export const openAiApiKey = env.OPENAI_API_KEY;
export const username = env.DISCORD_BOT_USERNAME;

if (!token) throw new Error('Discord token is not provided');
if (!openAiApiKey) throw new Error('OpenAI API key is not provided');

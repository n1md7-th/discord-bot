declare module 'bun' {
  interface Env {
    DISCORD_BOT_USERNAME: string;
    DISCORD_TOKEN: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_GUILD_ID: string;
    OPENAI_API_KEY: string;
  }
}

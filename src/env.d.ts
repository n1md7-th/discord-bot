declare module 'bun' {
  interface Env {
    DISCORD_BOT_USERNAME: string;
    DISCORD_TOKEN: string;
    OPENAI_API_KEY: string;
  }
}

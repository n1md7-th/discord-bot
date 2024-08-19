import { Client, GatewayIntentBits } from 'discord.js';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { isProduction, token } from '../config';

if (isProduction) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once('ready', async (client) => {
    console.info('Setting up user details');

    try {
      await client.user.setAvatar(join(cwd(), 'images/avatar.jpg'));
      await client.user.setBanner(join(cwd(), 'images/cover.jpeg'));

      console.info('User details set up successfully');
    } catch (error) {
      console.error('Error setting up user details:', error);
    }
  });

  client.login(token).catch((error) => {
    console.error('Error logging in:', error);
  });
}

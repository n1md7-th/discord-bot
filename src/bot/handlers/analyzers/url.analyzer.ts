import { type Message } from 'discord.js';
import type { Context } from '../../../utils/context.ts';
import { Randomizer } from '../../../utils/randomizer.ts';
import { CreateHandler } from '../../abstract/handlers/create.handler.ts';

export class UrlAnalyzer extends CreateHandler {
  private readonly emojis = new Randomizer(['👻', '👀', '🙃', '🦾', '🖥️', '💻', '📱']);

  async handle(message: Message, context: Context): Promise<void> {
    if (this.hasUrl(message)) {
      context.logger.info('Url analyzer invoked');

      const extractedUrls = this.extractUrls(message);
      if (!extractedUrls) return;

      const sanitizedSocialMediaUrls = [];
      for (const originalExtractedUrl of extractedUrls) {
        const targetUrl = await this.getRedirectionUrl(originalExtractedUrl);
        if (!this.isSocialMediaUrl(targetUrl)) continue;

        const sanitizedUrl = this.removeTracker(targetUrl);
        if (sanitizedUrl !== originalExtractedUrl) {
          sanitizedSocialMediaUrls.push(sanitizedUrl);
        }
      }

      if (sanitizedSocialMediaUrls.length === 0) return;

      const s = sanitizedSocialMediaUrls.length > 1 ? 's' : '';
      const is = sanitizedSocialMediaUrls.length > 1 ? 'are' : 'is';

      await message.reply(
        `I've noticed social media URLs with tracking parameters ${this.emojis.getRandom()}.` +
          ` Here ${is} the sanitized version${s}: ${sanitizedSocialMediaUrls.join(', ')}`,
      );

      context.logger.info('Url analyzer cleaned up the urls');
      context.logger.info('Url analyzer executed');
    }
  }

  private hasUrl(message: Message) {
    return /https?:\/\/\S+\.\S+/.test(message.content);
  }

  private extractUrls(message: Message) {
    return message.content.match(/https?:\/\/\S+\.\S+/g);
  }

  private isSocialMediaUrl(url: string) {
    return (
      this.isFacebookUrl(url) ||
      this.isInstagramUrl(url) ||
      this.isTwitterUrl(url) ||
      this.isTiKTokUrl(url) ||
      this.isYoutubeUrl(url)
    );
  }

  private isFacebookUrl(url: string) {
    return /facebook.com|fb.com|fb.me/.test(url);
  }

  private isInstagramUrl(url: string) {
    return /instagram.com|instagr.am/.test(url);
  }

  private isTwitterUrl(url: string) {
    return /twitter.com|t.co/.test(url);
  }

  private isTiKTokUrl(url: string) {
    return /tiktok.com/.test(url);
  }

  private isYoutubeUrl(url: string) {
    return /youtube.com|youtu.be/.test(url);
  }

  private async getRedirectionUrl(url: string) {
    const response = await fetch(url, { redirect: 'manual' });

    const hasRedirection = [301, 302, 303].includes(response.status);
    if (hasRedirection) return response.headers.get('location')!;

    return url;
  }

  private removeTracker(url: string) {
    const urlObject = new URL(url);

    switch (true) {
      case this.isFacebookUrl(url):
        urlObject.searchParams.delete('fbclid');
        urlObject.searchParams.delete('mibextid');
        urlObject.searchParams.delete('mib');
        break;
      case this.isInstagramUrl(url):
        urlObject.searchParams.delete('igshid');
        urlObject.searchParams.delete('igsh');
        break;
      case this.isTwitterUrl(url):
        urlObject.searchParams.delete('ref_src');
        urlObject.searchParams.delete('ref_url');
        urlObject.searchParams.delete('ref');
        break;
      case this.isTiKTokUrl(url):
        urlObject.searchParams.delete('_t');
        urlObject.searchParams.delete('_r');
        urlObject.searchParams.delete('is_copy_url');
        urlObject.searchParams.delete('is_from_webapp');
        urlObject.searchParams.delete('sender_device');
        break;
      case this.isYoutubeUrl(url):
        urlObject.searchParams.delete('si');
        urlObject.searchParams.delete('feature');
        urlObject.searchParams.delete('app');
        urlObject.searchParams.delete('utm_source');
        urlObject.searchParams.delete('utm_campaign');
        urlObject.searchParams.delete('utm_medium');
        urlObject.searchParams.delete('utm_content');
        break;
    }

    return urlObject.toString();
  }
}

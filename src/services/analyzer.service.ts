export type SanitizedUrl = {
  original: string;
  sanitized: string;
};

export class UrlAnalyzerService {
  removeTrackers(message: string | null) {
    if (!message || !this.hasUrl(message)) return message || '<Empty>';

    const extractedUrls = this.extractUrls(message);

    if (!extractedUrls) return message;

    return this.sanitizeUrls(extractedUrls).then((sanitizedUrls) => {
      return this.replaceTextWithSanitizedUrl(message, sanitizedUrls);
    });
  }

  isSameContent(message: string, sanitizedContent: string) {
    return message === sanitizedContent;
  }

  hasUrl(message: string) {
    return /https?:\/\/\S+\.\S+/.test(message);
  }

  private async sanitizeUrls(extractedUrls: string[]) {
    const sanitizedSocialMediaUrls: SanitizedUrl[] = [];

    for (const originalExtractedUrl of extractedUrls) {
      const targetUrl = await this.getRedirectionUrl(originalExtractedUrl);
      if (!this.isSocialMediaUrl(targetUrl)) continue;

      const sanitizedUrl = this.removeTracker(targetUrl);
      if (sanitizedUrl !== originalExtractedUrl) {
        sanitizedSocialMediaUrls.push({ sanitized: sanitizedUrl, original: originalExtractedUrl });
      }
    }

    return sanitizedSocialMediaUrls;
  }

  private replaceTextWithSanitizedUrl(text: string, urls: SanitizedUrl[]) {
    for (const { original, sanitized } of urls) {
      text = text.replace(original, sanitized);
    }

    return text;
  }

  private extractUrls(message: string) {
    return message.match(/https?:\/\/\S+\.\S+/g);
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
        urlObject.searchParams.delete('rdid');
        urlObject.searchParams.delete('share_url');
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

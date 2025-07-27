import type { StoryAnalysis } from "@shared/schema";

export class StoryParser {
  static async analyzeUrl(url: string): Promise<StoryAnalysis> {
    const response = await fetch("/api/stories/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze story");
    }

    return response.json();
  }

  static getSiteFromUrl(url: string): string {
    if (url.includes('archiveofourown.org')) return 'Archive of Our Own';
    if (url.includes('fanfiction.net')) return 'FanFiction.Net';
    if (url.includes('fictionpress.com')) return 'FictionPress';
    if (url.includes('fimfiction.net')) return 'FIMFiction';
    if (url.includes('wattpad.com')) return 'Wattpad';
    return 'Unknown';
  }

  static isValidStoryUrl(url: string): boolean {
    const supportedSites = [
      'archiveofourown.org',
      'fanfiction.net',
      'fictionpress.com',
      'fimfiction.net',
      'wattpad.com'
    ];

    try {
      const urlObj = new URL(url);
      return supportedSites.some(site => urlObj.hostname.includes(site));
    } catch {
      return false;
    }
  }

  static extractStoryId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname.includes('archiveofourown.org')) {
        const match = urlObj.pathname.match(/\/works\/(\d+)/);
        return match ? match[1] : null;
      }
      
      if (urlObj.hostname.includes('fanfiction.net') || urlObj.hostname.includes('fictionpress.com')) {
        const match = urlObj.pathname.match(/\/s\/(\d+)/);
        return match ? match[1] : null;
      }
      
      if (urlObj.hostname.includes('fimfiction.net')) {
        const match = urlObj.pathname.match(/\/story\/(\d+)/);
        return match ? match[1] : null;
      }
      
      if (urlObj.hostname.includes('wattpad.com')) {
        const match = urlObj.pathname.match(/\/story\/(\d+)/);
        return match ? match[1] : null;
      }
      
      return null;
    } catch {
      return null;
    }
  }
}

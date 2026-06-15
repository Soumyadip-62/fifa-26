import { Injectable } from '@nestjs/common';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  author: string;
  image: string;
  language: string;
  category: string[];
  source_category: string[];
  published: string;
}

@Injectable()
export class NewsService {
  private readonly apiUrl = process.env.NEWS_API_URL;
  private readonly apiKey = process.env.NEWS_API_TOKEN;

  async getLatestNews(): Promise<NewsArticle[]> {
    if (!this.apiUrl) {
      throw new Error('NEWS_API_URL is not configured');
    }

    if (!this.apiKey) {
      throw new Error('NEWS_API_TOKEN is not configured');
    }

    const url = new URL('/v1/search', this.apiUrl);
    url.searchParams.set('keywords', 'FIFA 2026');
    url.searchParams.set('language', 'en');

    console.log(url);

    const response = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`News API request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();

    return data as NewsArticle[];
  }

  async getNewsByKeywords(keywords: string): Promise<NewsArticle[]> {
    if (!this.apiUrl) {
      throw new Error('NEWS_API_URL is not configured');
    }

    if (!this.apiKey) {
      throw new Error('NEWS_API_TOKEN is not configured');
    }

    const url = new URL('/v1/search', this.apiUrl);
    url.searchParams.set('keywords', keywords);
    url.searchParams.set('language', 'en');

    const response = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`News API request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();

    return data as NewsArticle[];
  }
}

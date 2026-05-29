export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  source?: string;
  author?: string;
  publishedAt: string;
  tags?: string[];
};

export type BlogPost = NewsArticle;

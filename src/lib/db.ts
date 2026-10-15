// Database helper for Cloudflare D1 with local fallback

export interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'published';
  created_at?: string;
  updated_at?: string;
}

// In-memory fallback for local dev when D1 binding isn't connected
const localStore = {
  articles: [
    {
      id: 'welcome-art-1',
      slug: 'welcome-to-embodied-llama',
      title: 'Welcome to Embodied Llama',
      description: 'The foundation of the Embodied Llama platform.',
      content: '# Welcome to Embodied Llama\n\nThis is your first article! You can edit this directly from the `/admin` browser interface.',
      status: 'published' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Article[],
  pageContents: {
    home_title: 'Embodied Llama',
    home_hero_heading: 'Welcome to Embodied Llama',
    home_hero_subtitle: 'Leading edge development, high-performance static delivery, and in-browser content management.',
  } as Record<string, string>,
};

export function getD1(locals?: any): any {
  return locals?.runtime?.env?.DB || null;
}

export async function initTables(d1: any) {
  if (!d1) return;
  await d1.batch([
    d1.prepare(`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `),
    d1.prepare(`
      CREATE TABLE IF NOT EXISTS page_contents (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `),
  ]);
}

export async function getAllArticles(d1: any): Promise<Article[]> {
  if (d1) {
    try {
      await initTables(d1);
      const res = await d1.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
      return (res.results as Article[]) || [];
    } catch (e) {
      console.error('D1 error fetching articles:', e);
    }
  }
  return localStore.articles;
}

export async function getArticleById(d1: any, id: string): Promise<Article | null> {
  if (d1) {
    try {
      await initTables(d1);
      const res = await d1.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first();
      return (res as Article) || null;
    } catch (e) {
      console.error('D1 error fetching article by ID:', e);
    }
  }
  return localStore.articles.find((a) => a.id === id) || null;
}

export async function getArticleBySlug(d1: any, slug: string): Promise<Article | null> {
  if (d1) {
    try {
      await initTables(d1);
      const res = await d1.prepare('SELECT * FROM articles WHERE slug = ?').bind(slug).first();
      return (res as Article) || null;
    } catch (e) {
      console.error('D1 error fetching article by slug:', e);
    }
  }
  return localStore.articles.find((a) => a.slug === slug) || null;
}

export async function saveArticle(d1: any, article: Omit<Article, 'created_at' | 'updated_at'> & { id?: string }): Promise<Article> {
  const now = new Date().toISOString();
  const id = article.id || `art_${Date.now()}`;
  const fullArticle: Article = {
    ...article,
    id,
    created_at: now,
    updated_at: now,
  };

  if (d1) {
    try {
      await initTables(d1);
      await d1.prepare(`
        INSERT INTO articles (id, slug, title, description, content, status, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
        ON CONFLICT(id) DO UPDATE SET
          slug = ?2,
          title = ?3,
          description = ?4,
          content = ?5,
          status = ?6,
          updated_at = ?7
      `).bind(
        fullArticle.id,
        fullArticle.slug,
        fullArticle.title,
        fullArticle.description,
        fullArticle.content,
        fullArticle.status,
        fullArticle.updated_at
      ).run();
      return fullArticle;
    } catch (e) {
      console.error('D1 error saving article:', e);
    }
  }

  const existingIndex = localStore.articles.findIndex((a) => a.id === fullArticle.id);
  if (existingIndex >= 0) {
    localStore.articles[existingIndex] = fullArticle;
  } else {
    localStore.articles.unshift(fullArticle);
  }
  return fullArticle;
}

export async function deleteArticle(d1: any, id: string): Promise<boolean> {
  if (d1) {
    try {
      await initTables(d1);
      await d1.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
      return true;
    } catch (e) {
      console.error('D1 error deleting article:', e);
    }
  }

  const idx = localStore.articles.findIndex((a) => a.id === id);
  if (idx >= 0) {
    localStore.articles.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getPageContents(d1: any): Promise<Record<string, string>> {
  if (d1) {
    try {
      await initTables(d1);
      const res = await d1.prepare('SELECT key, value FROM page_contents').all();
      const map: Record<string, string> = {};
      if (res.results) {
        for (const row of res.results as any[]) {
          map[row.key] = row.value;
        }
      }
      return map;
    } catch (e) {
      console.error('D1 error fetching page contents:', e);
    }
  }
  return localStore.pageContents;
}

export async function savePageContent(d1: any, key: string, value: string): Promise<void> {
  if (d1) {
    try {
      await initTables(d1);
      await d1.prepare(`
        INSERT INTO page_contents (key, value, updated_at)
        VALUES (?1, ?2, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
          value = ?2,
          updated_at = CURRENT_TIMESTAMP
      `).bind(key, value).run();
      return;
    } catch (e) {
      console.error('D1 error saving page content:', e);
    }
  }
  localStore.pageContents[key] = value;
}


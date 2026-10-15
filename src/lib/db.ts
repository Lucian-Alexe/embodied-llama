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
      id: 'art-1',
      slug: 'science-of-somatic-coaching-nervous-system',
      title: 'The Science of Somatic Coaching: How the Nervous System Heals',
      description: 'Explore why body-centered somatic coaching unlocks deep emotional healing and resilience beyond traditional talk therapy.',
      content: '# The Science of Somatic Coaching: How the Nervous System Heals\n\nReal transformation happens when we fully inhabit our physical experience. In somatic coaching, we learn that the body holds emotional memories and survival responses that intellect alone cannot resolve.\n\n### Shifting Out of Survival Mode\nWhen trauma or chronic stress overwhelms us, our nervous system enters fight, flight, or freeze. Somatic coaching introduces safe, body-first grounding techniques that signal safety directly to the brain stem.\n\n### Practical Grounding\nBy paying mindful attention to breath, subtle muscular tension, and bodily posture, we gradually restore regulation, calm, and genuine connection with our true self.',
      status: 'published' as const,
      created_at: '2026-10-10T10:00:00.000Z',
      updated_at: '2026-10-10T10:00:00.000Z',
    },
    {
      id: 'art-2',
      slug: 'befriending-your-body-somatic-mindfulness',
      title: 'Befriending Your Body: Moving from Judgment to Alliance',
      description: 'How somatic coaching guides us from resisting physical discomfort to treating our body as a wise and trusted ally.',
      content: '# Befriending Your Body: Moving from Judgment to Alliance\n\nFor many of us, our relationship with our body has been one of resistance, criticism, or disconnection. Somatic coaching invites us to make peace with the vessel that carries us.\n\n### Listening to the Soma\nInstead of treating tension as a nuisance to eliminate, we ask: *What is this sensation trying to tell me?* With gentle curiosity, old emotional blocks naturally dissolve.',
      status: 'published' as const,
      created_at: '2026-10-04T14:30:00.000Z',
      updated_at: '2026-10-04T14:30:00.000Z',
    },
    {
      id: 'art-3',
      slug: 'why-the-llama-boundaries-strength-humor',
      title: 'Why the Llama? Boundaries, Resilience, and Soft Power',
      description: 'Discover the special symbolism behind Embodied Llama and what this resilient animal teaches us about somatic boundaries.',
      content: '# Why the Llama? Boundaries, Resilience, and Soft Power\n\nLlamas are gentle and soft, yet fiercely capable of carrying heavy loads across rugged terrain. They are also famous for setting immediate, unapologetic boundaries!\n\nIn our somatic coaching practice, the llama reminds us that we can remain tender, compassionate, and open while firmly rooted in our authentic power.',
      status: 'published' as const,
      created_at: '2026-09-28T09:15:00.000Z',
      updated_at: '2026-09-28T09:15:00.000Z',
    },
    {
      id: 'art-4',
      slug: 'four-grounding-somatic-practices-for-stress',
      title: 'Four Grounding Somatic Practices to Soothe Daily Stress',
      description: 'Simple, effective somatic exercises including TTT tapping, body scans, and conscious breathwork you can use anywhere.',
      content: '# Four Grounding Somatic Practices to Soothe Daily Stress\n\nWhen life accelerates, cognitive reasoning often cannot keep up with an activated nervous system. Here are four practical somatic exercises:\n\n1. **Orienting to the Room**: Slowly turn your head and let your eyes settle on pleasant shapes and colors.\n2. **TTT Tapping**: Gentle rhythmic taps along collarbones and wrists to soothe anxious energy.\n3. **Long Exhalations**: Breathe out twice as long as you breathe in to stimulate the vagus nerve.\n4. **Grounding Through Feet**: Sense the solid contact between your soles and the earth beneath you.',
      status: 'published' as const,
      created_at: '2026-09-18T16:45:00.000Z',
      updated_at: '2026-09-18T16:45:00.000Z',
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


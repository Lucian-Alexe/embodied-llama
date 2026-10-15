export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../lib/auth';
import { getD1, saveArticle, deleteArticle, getAllArticles } from '../../lib/db';

export const GET: APIRoute = async ({ request, locals }) => {
  const cookieHeader = request.headers.get('cookie');
  if (!isAuthenticated(cookieHeader, locals?.runtime?.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const d1 = getD1(locals);
  const articles = await getAllArticles(d1);
  return new Response(JSON.stringify({ articles }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const cookieHeader = request.headers.get('cookie');
  if (!isAuthenticated(cookieHeader, locals?.runtime?.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const data = await request.json();
    if (!data.title || !data.slug) {
      return new Response(JSON.stringify({ error: 'Title and Slug are required' }), { status: 400 });
    }

    const d1 = getD1(locals);
    const saved = await saveArticle(d1, {
      id: data.id,
      title: data.title,
      slug: data.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
      description: data.description || '',
      content: data.content || '',
      status: data.status === 'published' ? 'published' : 'draft',
    });

    return new Response(JSON.stringify({ success: true, article: saved }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const cookieHeader = request.headers.get('cookie');
  if (!isAuthenticated(cookieHeader, locals?.runtime?.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing article ID' }), { status: 400 });
    }

    const d1 = getD1(locals);
    await deleteArticle(d1, id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
};


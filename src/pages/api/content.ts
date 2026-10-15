export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../lib/auth';
import { getD1, savePageContent, getPageContents } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  const d1 = getD1(locals);
  const contents = await getPageContents(d1);
  return new Response(JSON.stringify({ contents }), {
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
    const d1 = getD1(locals);

    if (data.key && typeof data.value === 'string') {
      await savePageContent(d1, data.key, data.value);
    } else if (typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string') {
          await savePageContent(d1, k, v);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500 });
  }
};


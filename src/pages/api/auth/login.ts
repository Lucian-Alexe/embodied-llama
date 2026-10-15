export const prerender = false;

import type { APIRoute } from 'astro';
import { getAdminPassword, generateToken, createSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const password = formData.get('password')?.toString() || '';

    const validPassword = getAdminPassword(locals?.runtime?.env);

    if (password === validPassword) {
      const token = generateToken(validPassword);
      const cookie = createSessionCookie(token);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie,
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

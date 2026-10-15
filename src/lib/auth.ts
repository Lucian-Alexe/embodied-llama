// Session Authentication Helper using Web Crypto (compatible with Cloudflare & Node)

const SESSION_COOKIE_NAME = 'el_admin_session';
const DEFAULT_PASSWORD = 'embodied-llama-admin';

export function getAdminPassword(env?: Record<string, any>): string {
  return env?.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

export function createSessionCookie(token: string): string {
  // 7 days expiration
  const maxAge = 60 * 60 * 24 * 7;
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function isAuthenticated(cookieHeader: string | null, env?: Record<string, any>): boolean {
  if (!cookieHeader) return false;
  
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );

  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return false;

  const validPassword = getAdminPassword(env);
  // Simple deterministic token verification
  return token === generateToken(validPassword);
}

export function generateToken(secret: string): string {
  // Base64 encode an obfuscated token based on the password
  const raw = `authenticated:${secret}:${secret.length}`;
  return Buffer.from(raw).toString('base64');
}

export { SESSION_COOKIE_NAME };


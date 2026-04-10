import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const SECRET = process.env.ADMIN_SECRET || 'change-this-secret-in-production';
const TOKEN_COOKIE = 'admin_token';
const TOKEN_MAX_AGE = 60 * 60 * 24; // 24h

function signToken(user: string): string {
    const expires = Date.now() + TOKEN_MAX_AGE * 1000;
    const payload = `${user}:${expires}`;
    const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    return Buffer.from(`${payload}:${sig}`).toString('base64');
}

function verifyToken(token: string): boolean {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        if (parts.length !== 3) return false;
        const [user, expiresStr, sig] = parts;
        const expires = parseInt(expiresStr, 10);
        if (Date.now() > expires) return false;
        const expected = crypto.createHmac('sha256', SECRET).update(`${user}:${expiresStr}`).digest('hex');
        return sig === expected;
    } catch {
        return false;
    }
}

export function login(user: string, pass: string): string | null {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        return signToken(user);
    }
    return null;
}

export async function isAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    return token ? verifyToken(token) : false;
}

export function isAuthenticatedFromRequest(req: NextRequest): boolean {
    const token = req.cookies.get(TOKEN_COOKIE)?.value;
    return token ? verifyToken(token) : false;
}

export { TOKEN_COOKIE, TOKEN_MAX_AGE };

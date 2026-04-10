import { NextRequest, NextResponse } from 'next/server';
import { login, TOKEN_COOKIE, TOKEN_MAX_AGE } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { user, pass } = body;

    const token = login(user, pass);
    if (!token) {
        return NextResponse.json({ error: 'Credentiale invalide' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: TOKEN_MAX_AGE,
        path: '/',
    });
    return res;
}

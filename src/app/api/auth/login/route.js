import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect.' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    await setAuthCookie(token);

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password, name, phone, region } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Mot de passe trop court (6 caractères min).' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { email, password: await hashPassword(password), name, phone, region },
    });

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    await setAuthCookie(token);

    return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

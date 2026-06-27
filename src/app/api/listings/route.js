import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/listings — liste (avec filtres optionnels)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const where = { status: 'active' };
  const breed = searchParams.get('breed');
  const discipline = searchParams.get('discipline');
  if (breed) where.breed = breed;
  if (discipline) where.discipline = discipline;

  try {
    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
    });
    return NextResponse.json({ listings });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// POST /api/listings — créer une annonce (auth requise)
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Vous devez être connecté.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, price, breed, age, sex, height, discipline, color, region, country, photos, videoUrl } = body;

    if (!title || !description || !price || !breed || !age || !sex || !region) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
    }

    // Médias obligatoires : exactement 3 photos + 1 vidéo
    if (!Array.isArray(photos) || photos.length !== 3) {
      return NextResponse.json({ error: 'Il faut exactement 3 photos.' }, { status: 400 });
    }
    if (!videoUrl) {
      return NextResponse.json({ error: 'Une vidéo est obligatoire.' }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseInt(price),
        breed,
        age: parseInt(age),
        sex,
        height: height ? parseInt(height) : null,
        discipline: discipline || null,
        color: color || null,
        videoUrl,
        region,
        country: country || 'France',
        sellerId: user.id,
        photos: { create: photos.map((url, i) => ({ url, order: i })) },
      },
      include: { photos: true },
    });

    return NextResponse.json({ ok: true, listing });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

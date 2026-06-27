import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Vous devez être connecté.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('photos');
    if (!files.length) {
      return NextResponse.json({ error: 'Aucune photo.' }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const urls = [];

    for (const file of files.slice(0, 8)) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const name = crypto.randomBytes(8).toString('hex') + '.webp';
      // Compression + redimensionnement
      const optimized = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      await writeFile(path.join(UPLOAD_DIR, name), optimized);
      urls.push(`/uploads/${name}`);
    }

    return NextResponse.json({ ok: true, urls });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors de l\'upload.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');

// Limites
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 Mo
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Vous devez être connecté.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const photos = formData.getAll('photos').filter((f) => f && f.size > 0);
    const video = formData.get('video');

    await mkdir(UPLOAD_DIR, { recursive: true });

    // --- Photos (exactement 3 attendues) ---
    const photoUrls = [];
    for (const file of photos.slice(0, 8)) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const name = crypto.randomBytes(8).toString('hex') + '.webp';
      const optimized = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      await writeFile(path.join(UPLOAD_DIR, name), optimized);
      photoUrls.push(`/uploads/${name}`);
    }

    // --- Vidéo (1 attendue) ---
    let videoUrl = null;
    if (video && video.size > 0) {
      if (!ALLOWED_VIDEO.includes(video.type)) {
        return NextResponse.json(
          { error: 'Format vidéo non supporté (MP4, WebM ou MOV).' },
          { status: 400 }
        );
      }
      if (video.size > MAX_VIDEO_BYTES) {
        return NextResponse.json(
          { error: 'Vidéo trop lourde (50 Mo max).' },
          { status: 400 }
        );
      }
      const ext = video.type === 'video/webm' ? '.webm' : video.type === 'video/quicktime' ? '.mov' : '.mp4';
      const vname = crypto.randomBytes(8).toString('hex') + ext;
      const vbuffer = Buffer.from(await video.arrayBuffer());
      await writeFile(path.join(UPLOAD_DIR, vname), vbuffer);
      videoUrl = `/uploads/${vname}`;
    }

    return NextResponse.json({ ok: true, urls: photoUrls, videoUrl });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors de l\'upload.' }, { status: 500 });
  }
}

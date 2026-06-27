import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

// Dossier où l'API d'upload écrit les fichiers (doit être identique à UPLOAD_DIR
// dans src/app/api/upload/route.js). En prod Coolify, monter un volume sur ce chemin.
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');

const CONTENT_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Empêcher tout path traversal : on ne garde que le nom de fichier final
  const safeName = path.basename(segments.join('/'));
  const filePath = path.join(UPLOAD_DIR, safeName);

  // Vérifier que le fichier reste bien dans UPLOAD_DIR
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await stat(resolved);
    const data = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

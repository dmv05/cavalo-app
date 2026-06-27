// Génère des médias de démo (3 photos + 1 vidéo) et les attache aux annonces existantes
const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const palettes = [
  ['#6B4226', '#C9A35C'],
  ['#8a5a3a', '#E0C690'],
  ['#5a7a4a', '#C9D8A0'],
  ['#4a6a8a', '#A0C8E0'],
];

async function makePhoto(label, colors, file) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="800" height="600" fill="${colors[0]}"/>
    <circle cx="400" cy="260" r="150" fill="${colors[1]}" opacity="0.5"/>
    <text x="400" y="280" font-size="120" text-anchor="middle">🐴</text>
    <text x="400" y="420" font-size="40" fill="#fff" text-anchor="middle" font-family="sans-serif">${label}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(path.join(UPLOAD_DIR, file));
}

function makeVideo(label, colors, file) {
  const out = path.join(UPLOAD_DIR, file);
  // Vidéo 4s : fond coloré + texte
  const cmd = `ffmpeg -y -f lavfi -i color=c=${colors[0].replace('#','0x')}:s=640x480:d=4 ` +
    `-vf "drawtext=text='${label}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2" ` +
    `-pix_fmt yuv420p -movflags +faststart "${out}"`;
  execSync(cmd, { stdio: 'ignore' });
}

async function main() {
  const listings = await prisma.listing.findMany({ include: { photos: true } });
  for (let li = 0; li < listings.length; li++) {
    const l = listings[li];
    const pal = palettes[li % palettes.length];
    // 3 photos
    const photoFiles = [];
    for (let i = 0; i < 3; i++) {
      const fname = `demo_${l.id}_${i}.webp`;
      await makePhoto(`Photo ${i + 1}`, pal, fname);
      photoFiles.push(`/uploads/${fname}`);
    }
    // 1 vidéo
    const vfile = `demo_${l.id}.mp4`;
    makeVideo(l.breed.replace(/'/g, ''), pal, vfile);

    // Remplacer les photos + set videoUrl
    await prisma.photo.deleteMany({ where: { listingId: l.id } });
    await prisma.listing.update({
      where: { id: l.id },
      data: {
        videoUrl: `/uploads/${vfile}`,
        photos: { create: photoFiles.map((url, i) => ({ url, order: i })) },
      },
    });
    console.log(`✅ ${l.title} → 3 photos + 1 vidéo`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

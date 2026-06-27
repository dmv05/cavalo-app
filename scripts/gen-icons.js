// Génère les icônes PWA (192 + 512) à partir d'un SVG cheval/marron
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(dir, { recursive: true });

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#6B4226"/>
  <circle cx="256" cy="256" r="180" fill="#C9A35C"/>
  <text x="256" y="256" font-size="240" text-anchor="middle" dominant-baseline="central">🐴</text>
  <text x="256" y="430" font-size="64" fill="#F5F0E8" text-anchor="middle" font-family="sans-serif" font-weight="bold">Cavalo</text>
</svg>`;

async function main() {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(dir, `icon-${size}.png`));
    console.log(`✅ icon-${size}.png`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

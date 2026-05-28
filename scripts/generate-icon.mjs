// Generates the app icon: Georgian flag white background with red cross + "TK" letters
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

function drawIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const s = size;
  const cx = s / 2;
  const cy = s / 2;

  // Background — deep navy
  ctx.fillStyle = '#1D3557';
  ctx.beginPath();
  const r = s * 0.12;
  ctx.roundRect(0, 0, s, s, r);
  ctx.fill();

  // White circle
  ctx.fillStyle = '#F1FAEE';
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // Georgian red cross
  const armW = s * 0.09;
  ctx.fillStyle = '#DA0000';
  // Horizontal arm
  ctx.fillRect(cx - s * 0.34, cy - armW / 2, s * 0.68, armW);
  // Vertical arm
  ctx.fillRect(cx - armW / 2, cy - s * 0.34, armW, s * 0.68);

  // "TK" text
  ctx.fillStyle = '#1D3557';
  ctx.font = `bold ${Math.round(s * 0.16)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TK', cx, cy);

  return c;
}

// 1024×1024 for App Store
const icon = drawIcon(1024);
writeFileSync(join(assetsDir, 'icon.png'), icon.toBuffer('image/png'));
console.log('✓ assets/icon.png (1024x1024)');

// Android foreground — same but smaller safe zone
const fg = drawIcon(1024);
writeFileSync(join(assetsDir, 'android-icon-foreground.png'), fg.toBuffer('image/png'));
console.log('✓ assets/android-icon-foreground.png');

// Simple solid background for adaptive icon
const bg = createCanvas(1024, 1024);
const bgCtx = bg.getContext('2d');
bgCtx.fillStyle = '#1D3557';
bgCtx.fillRect(0, 0, 1024, 1024);
writeFileSync(join(assetsDir, 'android-icon-background.png'), bg.toBuffer('image/png'));
console.log('✓ assets/android-icon-background.png');

// Monochrome (white on transparent)
const mono = createCanvas(1024, 1024);
const mCtx = mono.getContext('2d');
mCtx.clearRect(0, 0, 1024, 1024);
mCtx.fillStyle = '#ffffff';
mCtx.beginPath();
mCtx.arc(512, 512, 390, 0, Math.PI * 2);
mCtx.fill();
const armW = 1024 * 0.09;
mCtx.fillStyle = '#1D3557';
mCtx.fillRect(512 - 1024*0.34, 512 - armW/2, 1024*0.68, armW);
mCtx.fillRect(512 - armW/2, 512 - 1024*0.34, armW, 1024*0.68);
writeFileSync(join(assetsDir, 'android-icon-monochrome.png'), mono.toBuffer('image/png'));
console.log('✓ assets/android-icon-monochrome.png');

// Favicon 64×64
const fav = drawIcon(64);
writeFileSync(join(assetsDir, 'favicon.png'), fav.toBuffer('image/png'));
console.log('✓ assets/favicon.png');

console.log('\nAll icons generated successfully.');

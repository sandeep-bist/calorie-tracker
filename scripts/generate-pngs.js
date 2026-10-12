import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const toCrc = Buffer.concat([typeBuf, data]);
  chunk.writeUInt32BE(crc32(toCrc), 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = (Math.min(width, height) / 2) * (isMaskable ? 0.72 : 0.88);
  const midR = outerR * 0.75;
  const innerR = outerR * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: deep black / OLED (#050505)
      let r = 5, g = 5, b = 5, a = 255;

      // Outer ring: Emerald green (#10b981)
      if (dist >= midR && dist <= outerR) {
        const angle = Math.atan2(dy, dx);
        if (angle > -1.2 && angle < 2.4) {
          r = 16; g = 185; b = 129;
        }
      } 
      // Inner ring: Sky blue (#38bdf8)
      else if (dist >= innerR * 1.3 && dist <= midR * 0.88) {
        const angle = Math.atan2(dy, dx);
        if (angle < -0.8 || angle > 0.8) {
          r = 56; g = 189; b = 248;
        }
      } 
      // Core dot: emerald
      else if (dist <= innerR * 0.6) {
        r = 16; g = 185; b = 129;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generatePNG(180, 180));
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), generatePNG(192, 192));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), generatePNG(512, 512));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));

console.log('Successfully generated iOS and PWA PNG assets in /public');

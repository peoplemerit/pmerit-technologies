/**
 * Create simple PNG icons for the extension
 * Run with: node create-icons.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { deflateSync } from 'zlib';

// Simple 1x1 pixel red PNG (placeholder)
// For production, replace with proper AIXORD icon
const createPlaceholderPng = (size) => {
  // Minimal PNG file structure
  // This creates a simple colored square
  const width = size;
  const height = size;

  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Create image data (simple red square with AIXORD accent color #e94560)
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      // AIXORD accent color: #e94560
      rawData.push(0xe9); // R
      rawData.push(0x45); // G
      rawData.push(0x60); // B
    }
  }

  // Compress with zlib (deflate)
  const compressed = deflateSync(Buffer.from(rawData));

  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
};

const createChunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);

  // Calculate CRC
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
};

// CRC32 implementation
const crc32 = (buffer) => {
  let crc = 0xFFFFFFFF;
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  for (let i = 0; i < buffer.length; i++) {
    crc = table[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
  }

  return crc ^ 0xFFFFFFFF;
};

// Create icons directory
const iconsDir = 'icons';
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir);
}

// Generate icons
const sizes = [16, 32, 48, 128];
for (const size of sizes) {
  const png = createPlaceholderPng(size);
  writeFileSync(`${iconsDir}/icon${size}.png`, png);
  console.log(`Created icon${size}.png`);
}

console.log('Icons created successfully!');

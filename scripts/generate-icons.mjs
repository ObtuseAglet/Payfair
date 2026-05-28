// Generates the extension icon set: a rounded green square with a white check,
// signalling a "fair price". No image dependencies — pixels are drawn by hand
// and encoded as PNG with Node's built-in zlib.
import zlib from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZES = [16, 32, 48, 96, 128];
const SUPERSAMPLE = 4;
const GREEN = [14, 159, 110];
const WHITE = [255, 255, 255];

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/icon');

function roundedRectSdf(px, py, size, radius) {
  const half = size / 2;
  const qx = Math.abs(px - half) - (half - radius);
  const qy = Math.abs(py - half) - (half - radius);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - radius;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function renderPixel(px, size) {
  const radius = size * 0.22;
  const check = [
    [0.27, 0.52],
    [0.43, 0.68],
    [0.73, 0.34],
  ].map(([x, y]) => [x * size, y * size]);
  const thickness = size * 0.11;

  return (x, y) => {
    if (roundedRectSdf(x, y, size, radius) > 0) return [0, 0, 0, 0];
    const onCheck =
      distanceToSegment(x, y, ...check[0], ...check[1]) <= thickness / 2 ||
      distanceToSegment(x, y, ...check[1], ...check[2]) <= thickness / 2;
    return onCheck ? [...WHITE, 255] : [...GREEN, 255];
  };
}

function render(size) {
  const big = size * SUPERSAMPLE;
  const sample = renderPixel(undefined, big);
  const rgba = new Uint8ClampedArray(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const [pr, pg, pb, pa] = sample(x * SUPERSAMPLE + sx, y * SUPERSAMPLE + sy);
          r += pr * pa;
          g += pg * pa;
          b += pb * pa;
          a += pa;
        }
      }
      const i = (y * size + x) * 4;
      const opaque = a || 1;
      rgba[i] = r / opaque;
      rgba[i + 1] = g / opaque;
      rgba[i + 2] = b / opaque;
      rgba[i + 3] = a / (SUPERSAMPLE * SUPERSAMPLE);
    }
  }
  return rgba;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  return Buffer.concat([u32(data.length), body, u32(zlib.crc32(body))]);
}

function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    Buffer.from(rgba.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', Buffer.concat([u32(size), u32(size), Buffer.from([8, 6, 0, 0, 0])])),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(outDir, { recursive: true });
for (const size of SIZES) {
  writeFileSync(resolve(outDir, `${size}.png`), encodePng(size, render(size)));
  console.log(`icon/${size}.png`);
}

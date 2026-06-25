import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, parse } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(__dirname, 'assets', 'Library pic');
const outDir = join(__dirname, 'assets', 'Library pic converted');

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

const files = readdirSync(srcDir).filter(f => f.toUpperCase().endsWith('.HEIC'));

console.log(`Found ${files.length} HEIC files to convert...`);

let ok = 0, fail = 0;

for (const file of files) {
  const inputPath = join(srcDir, file);
  const outputName = parse(file).name + '.jpg';
  const outputPath = join(outDir, outputName);
  try {
    const { default: convert } = await import('heic-convert');
    const inputBuffer = readFileSync(inputPath);
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9,
    });
    writeFileSync(outputPath, outputBuffer);
    console.log(`  OK ${file} -> ${outputName}`);
    ok++;
  } catch (err) {
    console.error(`  FAIL ${file}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone! ${ok} converted, ${fail} failed.`);
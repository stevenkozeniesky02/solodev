// scripts/bundle-plugins.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.resolve(__dirname, '../../claude-plugins/plugins');
const TARGET_DIR = path.resolve(__dirname, '../plugins');

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Source plugins not found at ${SOURCE_DIR}`);
  process.exit(1);
}

// Clean target
if (fs.existsSync(TARGET_DIR)) {
  fs.rmSync(TARGET_DIR, { recursive: true });
}

// Copy all plugins
fs.cpSync(SOURCE_DIR, TARGET_DIR, { recursive: true });

const count = fs.readdirSync(TARGET_DIR).filter(f =>
  fs.statSync(path.join(TARGET_DIR, f)).isDirectory()
).length;

console.log(`Bundled ${count} plugins to ${TARGET_DIR}`);

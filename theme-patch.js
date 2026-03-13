import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'frontend', 'src');

const replacements = [
  { regex: /text-slate-200/g, replacement: 'text-slate-800' },
  { regex: /text-slate-300/g, replacement: 'text-slate-700' },
  { regex: /text-slate-400/g, replacement: 'text-slate-600' },
  { regex: /text-slate-500/g, replacement: 'text-slate-500' }, // Kept same but listed for clarity
  { regex: /text-white/g, replacement: 'text-slate-900' },
  { regex: /bg-white/g, replacement: 'bg-slate-50' }, 
  { regex: /bg-terra-void\/([0-9]+)/g, replacement: 'bg-white/$1' },
  { regex: /bg-terra-primary\/([0-9]+)/g, replacement: 'bg-white/$1' },
  { regex: /border-terra-border\/([0-9]+)/g, replacement: 'border-slate-300/$1' },
  // specific map style fixes for light theme defaults
  { regex: /mapStyle \=== 'dark'/g, replacement: "mapStyle === 'satellite'" }
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

console.log('Starting light theme class replacement...');
let updatedFilesCount = 0;

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    replacements.forEach(({ regex, replacement }) => {
      content = content.replace(regex, replacement);
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath.replace(directoryPath, '')}`);
      updatedFilesCount++;
    }
  }
});

console.log(`Finished. Updated ${updatedFilesCount} files.`);

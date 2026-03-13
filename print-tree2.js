import fs from 'fs';
import path from 'path';

let out = '';
function printTree(dir, prefix = '') {
  let files;
  try {
    files = fs.readdirSync(dir).filter(f => !['node_modules', '.git', 'dist', '.vite', '.env'].includes(f));
  } catch (e) {
    return;
  }
  
  files.forEach((file, index) => {
    const isLast = index === files.length - 1;
    const filePath = path.join(dir, file);
    let stats;
    try {
      stats = fs.statSync(filePath);
    } catch (e) {
      return;
    }
    
    out += prefix + (isLast ? '└── ' : '├── ') + file + '\n';
    if (stats.isDirectory()) {
      printTree(filePath, prefix + (isLast ? '    ' : '│   '));
    }
  });
}

out += 'Terra-AI\n';
printTree(process.cwd());
fs.writeFileSync('tree-output2.txt', out, 'utf8');

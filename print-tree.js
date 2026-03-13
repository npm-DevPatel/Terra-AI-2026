import fs from 'fs';
import path from 'path';

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
    
    console.log(prefix + (isLast ? '└── ' : '├── ') + file);
    if (stats.isDirectory()) {
      printTree(filePath, prefix + (isLast ? '    ' : '│   '));
    }
  });
}

console.log('Terra-AI');
printTree(process.cwd());

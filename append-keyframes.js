const fs = require('fs');
const path = 'g:/Dev/Documents/USIU/Year 3/Sem 2/APP4080/Innovation challenge/project 2/Terra-AI/frontend/src/index.css';
const extra = `
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
`;
let content = fs.readFileSync(path, 'utf8');
content = content.trimEnd() + '\n' + extra;
fs.writeFileSync(path, content, 'utf8');
console.log('Done');

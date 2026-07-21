const fs = require('fs');
const path = require('path');

function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      findTsxFiles(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = findTsxFiles(path.join(process.cwd(), 'src'));
let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('createPortal(')) {
    let original = content;
    
    content = content.replace(/className=\"([^\"]*fixed[^\"]*inset-0[^\"]*)\"/g, (match, classes) => {
      let newClasses = classes;
      newClasses = newClasses.replace(/\bz-\[?\d+\]?\b/g, '').trim();
      newClasses += ' z-[9999]';
      newClasses = newClasses.replace(/\banimate-in\b/g, '').replace(/\bfade-in\b/g, '').replace(/\bzoom-in-\d+\b/g, '').replace(/\bduration-\d+\b/g, '');
      if (!newClasses.includes('animate-modal-overlay')) { newClasses += ' animate-modal-overlay'; }
      newClasses = newClasses.replace(/\s+/g, ' ').trim();
      return 'className=\"' + newClasses + '\"';
    });
    
    content = content.replace(/className=\"([^\"]*bg-white[^\"]*rounded-[^\"]*shadow-[^\"]*)\"/g, (match, classes) => {
      let newClasses = classes;
      newClasses = newClasses.replace(/\banimate-in\b/g, '').replace(/\bfade-in\b/g, '').replace(/\bzoom-in-\d+\b/g, '').replace(/\bduration-\d+\b/g, '');
      if (!newClasses.includes('animate-modal-card')) { newClasses += ' animate-modal-card'; }
      newClasses = newClasses.replace(/\s+/g, ' ').trim();
      return 'className=\"' + newClasses + '\"';
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated:', path.basename(file));
      updatedCount++;
    }
  }
}
console.log('Total files updated:', updatedCount);

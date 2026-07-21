const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        filelist = walkSync(filePath, filelist);
      }
    } else if (filePath.endsWith('.tsx')) {
      filelist.push(filePath);
    }
  });
  return filelist;
};

const files = walkSync('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Look for modal indicators
  if ((content.includes('bg-black/60') || content.includes('bg-black/90') || content.includes('backdrop-blur')) && content.includes('fixed') && content.includes('inset-0')) {
    if (!content.includes('createPortal')) {
      console.log('Needs portal:', file);
    }
  }
}

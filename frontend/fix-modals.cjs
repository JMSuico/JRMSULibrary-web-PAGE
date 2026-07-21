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

  // Check if this file has a modal overlay that needs createPortal
  if ((content.includes('bg-black/60') || content.includes('bg-black/90') || content.includes('backdrop-blur')) 
      && content.includes('fixed') && content.includes('inset-0')) {
      
    if (!content.includes('createPortal(')) {
      console.log('Fixing:', file);
      
      // 1. Add import
      if (!content.includes("import { createPortal } from 'react-dom';")) {
          // find first import and inject it
          content = content.replace(/(import .*;\r?\n)/, "$1import { createPortal } from 'react-dom';\n");
      }

      // We cannot easily parse AST here, but we can do a smart regex replacement 
      // if the modal is returned directly like: return ( <div className="fixed inset-0 ..."> ... </div> );
      // Or if it is a conditional return: return isOpen ? ( <div className="fixed inset-0 ..."> ... </div> ) : null;
      
      // Since manual edit is safer for conditional renders, let's just log them and I will fix them manually if they're too complex
      
      // Wait, there's a simpler way. Modals are often returned like:
      // return (
      //   <div className="fixed inset-0...
      // ...
      //   </div>
      // );
      
      // I will manually fix them using multi_replace_file_content.
    }
  }
}

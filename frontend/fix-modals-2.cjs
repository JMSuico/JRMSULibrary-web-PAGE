const fs = require('fs');

const fixModal = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('createPortal')) {
    // Inject import
    content = content.replace(/(import .*;\r?\n)/, "$1import { createPortal } from 'react-dom';\n");
    
    // Find the return wrapper
    // Usually it's `return (\n    <div className="fixed`
    const regex = /(return\s*\(\s*)(<div[^>]*className=["'][^"']*fixed[^"']*inset-0[^>]*>)/;
    if (regex.test(content)) {
      content = content.replace(regex, 'return createPortal(\n    $2');
      // Now we have to append `, document.body)` before the last `);` of that block.
      // Since these are isolated components, replacing the last `\n  );\n}` with `\n    ,\n    document.body\n  );\n}` usually works.
      const lastParen = content.lastIndexOf(');');
      if (lastParen !== -1) {
        content = content.slice(0, lastParen) + ',\n    document.body\n  ' + content.slice(lastParen);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Fixed:", filePath);
      }
    }
  }
};

fixModal('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Modals\\ExternalIframeModal.tsx');
fixModal('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Modals\\FileViewerModal.tsx');
fixModal('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Modals\\NotificationDetailModal.tsx');
fixModal('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Modals\\BookListModal.tsx');


const fs = require('fs');

const fixInlineModals = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  // Add import if needed
  if (!content.includes('createPortal')) {
    content = content.replace(/(import .*;\r?\n)/, "$1import { createPortal } from 'react-dom';\n");
    modified = true;
  }

  // 1. BooksManagerPage.tsx
  if (filePath.includes('BooksManagerPage.tsx')) {
    if (content.includes('{viewAllOpen && (')) {
      content = content.replace(
        /\{viewAllOpen && \(\s*<div className="fixed inset-0 z-\[100\] bg-black\/60 backdrop-blur-sm flex items-center justify-center p-4" onClick=\{.*\}>[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
        (match) => {
          const jsxStart = match.indexOf('<div');
          const jsxEnd = match.lastIndexOf('</div>') + 6;
          const jsx = match.substring(jsxStart, jsxEnd);
          return `{viewAllOpen && createPortal(\n${jsx},\ndocument.body\n)}`;
        }
      );
      modified = true;
    }
  }

  // 2. BatchHistoryPage.tsx
  // No modal in BatchHistoryPage? Let's check if there is one. 
  // It has a <AuditTrailModal /> which is a separate component... wait, let's look at it.

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Fixed:", filePath);
  }
};

fixInlineModals('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\BooksManagerPage.tsx');

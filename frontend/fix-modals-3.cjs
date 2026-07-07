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

  // Regex to match inline modal blocks like:
  // {condition && (
  //   <div className="fixed ...">
  //     ...
  //   </div>
  // )}
  
  // Since parsing `{condition && ( <div... )} ` accurately with Regex is notoriously brittle for nested tags,
  // let's do a simple string replacement for the known modal wrappers in these specific pages.

  // 1. UserManagementPage.tsx
  // has: {viewingImage && ( <div className="fixed inset-0...
  if (filePath.includes('UserManagementPage.tsx')) {
    if (content.includes('{viewingImage && (')) {
      content = content.replace(
        /\{viewingImage && \(\s*<div className="fixed inset-0 bg-black\/60 z-\[100\] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick=\{.*\}>\s*<div className="relative max-w-4xl max-h-\[90vh\]"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
        (match) => {
          // extract the inner JSX from the match
          const jsxStart = match.indexOf('<div');
          const jsxEnd = match.lastIndexOf('</div>') + 6;
          const jsx = match.substring(jsxStart, jsxEnd);
          return `{viewingImage && createPortal(\n${jsx},\ndocument.body\n)}`;
        }
      );
      modified = true;
    }
  }

  // 2. SectionsManagerPage.tsx
  // has two modals: `{viewingImage && ...}` and `{isGalleryModalOpen && ...}`
  if (filePath.includes('SectionsManagerPage.tsx')) {
    // Gallery Modal
    content = content.replace(
      /\{isGalleryModalOpen && \(\s*<div className="fixed inset-0 bg-black\/60 z-\[100\] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
      (match) => {
        const jsxStart = match.indexOf('<div');
        const jsxEnd = match.lastIndexOf('</div>') + 6;
        const jsx = match.substring(jsxStart, jsxEnd);
        return `{isGalleryModalOpen && createPortal(\n${jsx},\ndocument.body\n)}`;
      }
    );
    // Viewing Image Modal
    content = content.replace(
      /\{viewingImage && \(\s*<div className="fixed inset-0 bg-black\/60 z-\[100\] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" onClick=\{.*\}>[\s\S]*?<\/div>\s*<\/div>\s*\)\}/,
      (match) => {
        const jsxStart = match.indexOf('<div');
        const jsxEnd = match.lastIndexOf('</div>') + 6;
        const jsx = match.substring(jsxStart, jsxEnd);
        return `{viewingImage && createPortal(\n${jsx},\ndocument.body\n)}`;
      }
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Fixed:", filePath);
  }
};

fixInlineModals('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\UserManagementPage.tsx');
fixInlineModals('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\SectionsManagerPage.tsx');

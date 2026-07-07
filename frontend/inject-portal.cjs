const fs = require('fs');

const files = [
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Modals\\ExternalIframeModal.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Modals\\FileViewerModal.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Shared\\FacebookBubble.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Features\\Admin\\components\\BookFormModal.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\BatchHistoryPage.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\BooksManagerPage.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\ContentManagerPage.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\EmailMessagePage.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\EResourcesManagerPage.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\SectionsManagerPage.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Pages\\Admin\\UserManagementPage.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Features\\PhysicalSetup\\components\\LibrarySectionCarousel.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Features\\Collection\\components\\BlueModalCarousel.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Modals\\NotificationDetailModal.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Shared\\RizalChatBubble.tsx',
  'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\frontend\\src\\Components\\Modals\\BookListModal.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Skip if already imported
  if (!content.includes('createPortal')) {
    // Inject import
    content = content.replace(/(import .*;\r?\n)/, "$1import { createPortal } from 'react-dom';\n");
    
    // We want to replace <div className="fixed inset-0... or similar modal wrappers with createPortal(<div..., document.body)
    // But since some are inline conditionals like: `isOpen && ( <div className="fixed...`
    // We can replace `<div className="fixed inset-0` with `createPortal(<div className="fixed inset-0`
    // But then we have to find the closing div to append `, document.body)`. This is very hard with regex.
    // So let's NOT do automated replacement of the JSX. 
    console.log("Needs manual update:", file);
  }
}

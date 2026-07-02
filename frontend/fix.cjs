const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const moduleMap = {
    // Pages
    "HomePage": "@/src/Pages/Home/HomePage",
    "AboutPage": "@/src/Pages/About/AboutPage",
    "AdministrationPage": "@/src/Pages/Administration/AdministrationPage",
    "CollectionPage": "@/src/Pages/Collection/CollectionPage",
    "PersonnelPage": "@/src/Pages/Personnel/PersonnelPage",
    "PhysicalSetupPage": "@/src/Pages/PhysicalSetup/PhysicalSetupPage",
    "ServicesPage": "@/src/Pages/Services/ServicesPage",
    
    // Feature: Home
    "HeroSection": "@/src/Features/Home/components/HeroSection",
    "LibraryMapSection": "@/src/Features/Home/components/LibraryMapSection",
    
    // Feature: Services
    "ServicesSection": "@/src/Features/Services/components/ServicesSection",
    "ExternalServicesSection": "@/src/Features/Services/components/ExternalServicesSection",
    
    // Feature: Feedback
    "FeedbackSection": "@/src/Features/Feedback/components/FeedbackSection",
    "FeedbackStickyCard": "@/src/Features/Feedback/components/FeedbackStickyCard",
    
    // Feature: Collection
    "NewlyAcquiredBooks": "@/src/Features/Collection/components/NewlyAcquiredBooks",
    "BlueModalCarousel": "@/src/Features/Collection/components/BlueModalCarousel",
    
    // Feature: PhysicalSetup
    "LibrarySectionCarousel": "@/src/Features/PhysicalSetup/components/LibrarySectionCarousel",
    
    // Feature: Personnel
    "PersonnelSection": "@/src/Features/Personnel/components/PersonnelSection",
    
    // Feature: EResources
    "EResourcesPage": "@/src/Features/EResources/components/EResourcesPage",
    
    // Feature: AIAssistant
    "RizalAssistant": "@/src/Features/AIAssistant/components/RizalAssistant",
    
    // Components: LayoutBars
    "TopNavBar": "@/src/Components/LayoutBars/TopNavBar",
    "Footer": "@/src/Components/LayoutBars/Footer",
    
    // Components: Modals
    "BookListModal": "@/src/Components/Modals/BookListModal",
    "FileViewerModal": "@/src/Components/Modals/FileViewerModal",
    
    // Components: Shared
    "FacebookBubble": "@/src/Components/Shared/FacebookBubble",
    "ImageGallery": "@/src/Components/Shared/ImageGallery",
    "SkeletonLoader": "@/src/Components/Shared/SkeletonLoader",
    "TreeView": "@/src/Components/Shared/TreeView",
    "UOPACSection": "@/src/Components/Shared/UOPACSection",
    
    // Hooks
    "useIntersectionObserver": "@/src/Hooks/useIntersectionObserver",
    
    // Assets/Libs
    "data": "@/src/Libs/Assets/data",
    "treeData": "@/src/Libs/Assets/treeData"
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

const importRegex = /from\s+['"]([^'"]+)['"]/g;
const lazyImportRegex = /import\(['"]([^'"]+)['"]\)/g;

walkDir(srcDir, (filepath) => {
    if (!filepath.endsWith('.ts') && !filepath.endsWith('.tsx') && !filepath.endsWith('.css')) return;
    
    let content = fs.readFileSync(filepath, 'utf-8');
    let modified = false;

    if (filepath.endsWith('main.tsx')) {
        content = content.replace(/import\s+['"]\.\/index\.css['"];/, "import '@/src/LayoutStyles/index.css';");
        modified = true;
    }

    content = content.replace(importRegex, (match, p1) => {
        const parts = p1.split('/');
        const moduleName = parts[parts.length - 1];
        if (moduleMap[moduleName]) {
            modified = true;
            return `from '${moduleMap[moduleName]}'`;
        }
        if (moduleName === 'eBooksTree.json') {
            modified = true;
            return `from '@/src/Libs/Assets/eBooksTree.json'`;
        }
        return match;
    });

    content = content.replace(lazyImportRegex, (match, p1) => {
        const parts = p1.split('/');
        const moduleName = parts[parts.length - 1];
        if (moduleMap[moduleName]) {
            modified = true;
            return `import('${moduleMap[moduleName]}')`;
        }
        return match;
    });

    if (modified) {
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log(`Updated imports in ${filepath}`);
    }
});

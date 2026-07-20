import React from 'react';
import { useIntersectionObserver } from '@/src/Hooks/useIntersectionObserver';
import { assets } from '@/src/Libs/Assets/data';
import { cmsApi, PageContent } from '@/src/Endpoints/cmsApi';
import { personnelApi } from '@/src/Endpoints/personnelApi';
import { Loader2 } from 'lucide-react';

function extractTextBlocksFromHtml(html: string): string[] {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const items = Array.from(doc.querySelectorAll('p'))
    .map(el => el.textContent?.trim() || '')
    .filter(text => text.length > 0);
  if (items.length === 0) return [doc.body.textContent?.trim() || ''];
  return items;
}

export const PersonnelSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [personnelContent, setPersonnelContent] = React.useState<PageContent | null>(null);

  const [personnelList, setPersonnelList] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        const contents = await cmsApi.getAllContent();
        setPersonnelContent(contents.find(c => c.slug === 'personnel_text') || null);
      } catch (err) {
        console.error('Failed to load Personnel content', err);
      }
    };
    fetchContent();
  }, []);

  React.useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const staff = await personnelApi.getPersonnel();
        setPersonnelList(staff.sort((a,b) => a.order - b.order));
      } catch (err) {
        console.error('Failed to load Personnel list', err);
      }
    };
    fetchPersonnel();
  }, []);

  // Listen to cms updates
  React.useEffect(() => {
    const handleCmsUpdate = () => {
      personnelApi.getPersonnel().then(staff => {
        setPersonnelList(staff.sort((a,b) => a.order - b.order));
      }).catch(console.error);
    };
    window.addEventListener('cms_updated', handleCmsUpdate);
    return () => window.removeEventListener('cms_updated', handleCmsUpdate);
  }, []);

  const textBlocks = personnelContent ? extractTextBlocksFromHtml(personnelContent.content) : [];
  
  // Split personnel into Chief (order === 1) and Staff (order > 1)
  const chiefLibrarian = personnelList.find(p => p.order === 1) || {
    name: 'Kiara Keren M. Alavanza',
    title: 'Campus Librarian',
    photo: assets.images.chiefLibrarian
  };
  const staffList = personnelList.filter(p => p.order > 1).sort((a,b) => a.order - b.order);
  
  // Render Dynamic SVG Connectors
  const renderConnectors = () => {
    const n = Math.min(staffList.length, 5);
    if (n === 0) return null;

    const points: number[] = [];
    const viewBoxWidth = 1000;
    const centerLine = viewBoxWidth / 2;
    
    // For n elements, divide the viewBox equally and find the center of each chunk
    const step = viewBoxWidth / n;
    const startX = step / 2;

    for (let i = 0; i < n; i++) {
      points.push(startX + (i * step));
    }

    const minX = Math.min(...points, centerLine);
    const maxX = Math.max(...points, centerLine);

    return (
      <div className="hidden lg:block w-full h-12 relative -mt-4 mb-2 z-10 fade-up-entrance">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${viewBoxWidth} 80`} preserveAspectRatio="none">
          <defs>
            <marker id="arrowhead-gold" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill='var(--color-gold)' />
            </marker>
          </defs>
          <path d={`M ${centerLine} 0 L ${centerLine} 20`} stroke='var(--color-gold)' strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
          
          {n > 1 && (
            <path d={`M ${minX} 20 L ${maxX} 20`} stroke='var(--color-gold)' strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
          )}
          
          {points.map((x, idx) => (
            <path key={idx} d={`M ${x} 20 L ${x} 45`} stroke='var(--color-gold)' strokeWidth="2" fill="none" markerEnd="url(#arrowhead-gold)" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>
    );
  };

  const getGridColsClass = (n: number) => {
    if (n === 1) return 'lg:grid-cols-1 max-w-sm';
    if (n === 2) return 'lg:grid-cols-2 max-w-2xl';
    if (n === 3) return 'lg:grid-cols-3 max-w-4xl';
    if (n === 4) return 'lg:grid-cols-4 max-w-6xl';
    if (n >= 5) return 'lg:grid-cols-5 max-w-7xl';
    return 'lg:grid-cols-3 max-w-4xl';
  };

  return (
    <div id="staff" className={`py-section-py-desktop reveal ${isVisible ? 'visible' : ''}`} ref={ref as any}>
      <div id="personnel" className="max-w-max-width mx-auto px-4 md:px-gutter">

        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-4xl mb-4 font-bold" style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px var(--color-black-alpha-60)' }}>
            Library Personnel
          </h2>
          <p className="max-w-3xl mx-auto" style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px var(--color-black-alpha-50)' }}>
            Meet the dedicated library professionals committed to supporting learning, research, and academic excellence at JRMSU.
          </p>
        </div>

        <div className="p-4 md:p-8 mb-16 bg-transparent">
          <div className="flex flex-col items-center">
            {/* Librarian's Corner + Photo Card merged */}
            <div className="w-full mb-6 md:mb-10 max-w-5xl mx-auto">
              <div className="p-6 md:p-8 rounded-2xl shadow-lg border border-gold-light/20 hover-3d-tilt" style={{ background: 'var(--color-navy-alpha-50)', backdropFilter: 'blur(8px)' }}>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-center">
                  <div className="flex-1 text-left">
                    <h3 className="text-3xl font-bold font-headline-lg mb-4 text-primary drop-shadow-sm">Librarian's Corner</h3>
                    <p className="italic mb-4 text-white">
                      {textBlocks[0] || "From pages to possibilities—the JRMSU Library fosters knowledge, research, and lifelong learning in pursuit of excellence."}
                    </p>
                    <p className="text-sm leading-relaxed mb-4 text-white">
                      {textBlocks[1] || "The Library of Jose Rizal Memorial State University Katipunan Campus is committed to supporting the University's Vision, Mission, Goals, and Objectives by providing relevant, up-to-date, and accessible information resources and services. In adherence to the standards, the library continuously enhances its collections, facilities, and technological services to meet the evolving needs of its academic community. It also promotes information literacy, strengthens research support, and fosters collaborative linkages to contribute to institutional development. The library remains dedicated to delivering quality services and nurturing a culture of lifelong learning among its users."}
                    </p>
                    <p className="text-sm text-gold-light italic drop-shadow-sm font-medium">
                      {textBlocks[2] || "Thank you for making the library part of your journey. We are always here to support your learning, research, and growth—Padayon, JRMSUans!"}
                    </p>
                  </div>
                  
                  {/* Chief Librarian - Middle Right Side */}
                  <div className="w-64 flex-shrink-0 flex flex-col justify-center items-center text-center p-4 border-l-0 md:border-l border-gold-light/20">
                    <div className="w-40 h-40 rounded-full border-4 border-gold-light/40 overflow-hidden shadow-2xl mx-auto mb-4 relative group">
                      <img
                        alt={chiefLibrarian.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        src={chiefLibrarian.photo && (chiefLibrarian.photo.startsWith('http') || chiefLibrarian.photo.startsWith('/media')) ? chiefLibrarian.photo : (chiefLibrarian.photo ? `/media/${chiefLibrarian.photo}` : assets.images.chiefLibrarian)}
                      />
                    </div>
                    <div className="bg-navy-dark/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gold-light/10 shadow-lg w-full">
                      <h3 className="font-headline-md font-bold text-lg mb-1" style={{ color: 'var(--color-gold-light)' }}>{chiefLibrarian.name}</h3>
                      <div className="h-0.5 w-12 bg-gold-light/50 mx-auto mb-2"></div>
                      <p className="text-white/90 font-bold tracking-widest text-xs uppercase">{chiefLibrarian.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Curved Arrow SVG Connector */}
            {renderConnectors()}

            {/* Mobile/Tablet Down Arrow (from Librarian's Corner to first staff) */}
            {staffList.length > 0 && (
              <div className="flex flex-col items-center lg:hidden my-2 text-gold-light">
                <div className="w-0.5 h-6 bg-gold-light"></div>
                <span className="material-symbols-outlined text-lg leading-none -mt-1">arrow_downward</span>
              </div>
            )}

            {/* Staff Cards */}
            <div className={`grid grid-cols-1 ${getGridColsClass(staffList.length)} gap-4 w-full justify-items-center`}>
              {staffList.slice(0, 5).map((person, idx) => (
                <React.Fragment key={idx}>
                  {/* Arrow for 2nd and subsequent items on mobile/tablet */}
                  {idx > 0 && (
                    <div className="flex flex-col items-center lg:hidden my-2 text-gold-light">
                      <div className="w-0.5 h-6 bg-gold-light"></div>
                      <span className="material-symbols-outlined text-lg leading-none -mt-1">arrow_downward</span>
                    </div>
                  )}
                  <div className="fade-up-entrance flex flex-col items-center w-full min-w-[200px]" style={{ transitionDelay: `${0.2 * (idx + 1)}s` }}>
                  <div
                    className="border-2 border-gold-light/30 rounded-2xl p-4 text-center w-full shadow-md hover-3d-tilt flex-1 flex flex-col items-center justify-center"
                    style={{ background: 'var(--color-navy-alpha-50)', backdropFilter: 'blur(8px)' }}
                  >
                    {person.photo ? (
                      <div className="w-20 h-20 rounded-full border-2 border-gold-light/40 overflow-hidden shadow-lg mx-auto mb-3">
                        <img src={person.photo.startsWith('http') || person.photo.startsWith('/media') ? person.photo : `/media/${person.photo}`} alt={person.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-navy-dark text-gold-light flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-lg">
                        {person.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-headline-md font-bold mb-1 text-base leading-tight uppercase" style={{ color: 'var(--color-gold-light)' }}>
                      {person.name}
                    </h3>
                    <p className="font-label-caps font-semibold text-[10px]" style={{ color: 'var(--color-white-alpha-80)' }}>{person.title}</p>
                  </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

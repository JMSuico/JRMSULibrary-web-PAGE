import React from 'react';
import { ServicesSection } from '@/src/Features/Services/components/ServicesSection';

export default function ServicesPage() {
  return (
    <section className="pt-24 min-h-screen">
      <div className="max-w-max-width mx-auto px-4 md:px-gutter mb-6 pt-4">
        <div className="text-center mb-6">
          <h2 className="font-headline-lg font-bold text-4xl mb-4" style={{ color: 'var(--color-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            List of Services
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-primary)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Explore our streamlined processes for borrowing, research, and campus-wide clearances.
          </p>
        </div>
      </div>

      <ServicesSection />
    </section>
  );
}

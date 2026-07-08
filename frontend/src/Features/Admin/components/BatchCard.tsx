import React, { useState, useRef, useEffect } from 'react';
import { PackageOpen, Clock, Calendar, ShieldCheck, FileArchive, CheckCircle2, ClipboardList, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { AcquisitionBatch } from '@/src/Endpoints/batchApi';

interface BatchCardProps {
  key?: React.Key;
  batch: AcquisitionBatch;
  onContinue: (id: number) => void;
  onClose: (id: number) => void;
  onArchive: (id: number) => void;
  onReopen: (id: number) => void;
  onActivate: (id: number) => void;
  onViewBooks: (id: number) => void;
  onViewAudit: (batch: AcquisitionBatch) => void;
  onEdit: (batch: AcquisitionBatch) => void;
  onDelete: (batch: AcquisitionBatch) => void;
}

export function BatchCard({ batch, onContinue, onClose, onArchive, onReopen, onActivate, onViewBooks, onViewAudit, onEdit, onDelete }: BatchCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusColor = batch.status === 'open' ? 'var(--color-blue)' : batch.status === 'closed' ? 'var(--color-success)' : 'var(--color-gray-500)';

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="admin-grid-card" style={{ padding: '20px', borderTop: `4px solid ${statusColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-gray-900)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageOpen size={20} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{batch.name}</span>
          </h3>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem', marginTop: '4px' }}>{batch.description}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
          {batch.is_display_batch && (
            <span className="admin-badge admin-badge--success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Active Display
            </span>
          )}
          {!batch.is_display_batch && (
            <span className={`admin-badge admin-badge--${batch.status === 'open' ? 'info' : batch.status === 'closed' ? 'success' : 'warning'}`}>
              {batch.status.toUpperCase()}
            </span>
          )}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => setMenuOpen(v => !v)} className="admin-btn admin-btn--icon" title="More options" style={{ padding: '4px', borderRadius: '6px' }} aria-label="More options">
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, marginTop: '4px', background: 'var(--color-white)', border: '1px solid var(--color-outline-variant)', borderRadius: '10px', boxShadow: '0 8px 24px var(--color-black-alpha-10)', minWidth: '160px', overflow: 'hidden' }}>
                <button onClick={() => { setMenuOpen(false); onEdit(batch); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-container-low)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <Pencil size={15} /> Edit Batch
                </button>
                <div style={{ borderTop: '1px solid var(--color-surface-container-low)' }} />
                <button onClick={() => { setMenuOpen(false); onDelete(batch); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-red-600)', textAlign: 'left' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-red-50)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <Trash2 size={15} /> Remove Batch
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} />{new Date(batch.opened_at).toLocaleDateString()}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} />{batch.book_count || 0} Books</div>
      </div>

      <div className="admin-grid-card__actions" style={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <button className="admin-btn admin-btn--secondary" onClick={() => onViewBooks(batch.id)}><Eye size={16} /> View Books</button>
        <button className="admin-btn admin-btn--secondary" title="View Audit Trail" style={{ color: 'var(--color-indigo)' }} onClick={() => onViewAudit(batch)}><ClipboardList size={16} /> View Audit</button>
        {batch.status === 'open' && (<>
          <button className="admin-btn admin-btn--primary" onClick={() => onContinue(batch.id)}>Continue</button>
          <button className="admin-btn admin-btn--secondary" onClick={() => onClose(batch.id)} style={{ color: 'var(--color-red-700)' }}><CheckCircle2 size={16} /> Close Batch</button>
        </>)}
        {batch.status === 'closed' && (<>
          {!batch.is_display_batch && (<button className="admin-btn admin-btn--primary" onClick={() => onActivate(batch.id)}>Set as Display</button>)}
          <button className="admin-btn admin-btn--secondary" onClick={() => onArchive(batch.id)}><FileArchive size={16} /> Archive</button>
          <button className="admin-btn admin-btn--secondary" onClick={() => onReopen(batch.id)}>Reopen</button>
        </>)}
        {batch.status === 'archived' && (<button className="admin-btn admin-btn--secondary" onClick={() => onReopen(batch.id)}>Reopen</button>)}
      </div>
    </div>
  );
}



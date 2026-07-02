import React from 'react';
import { PackageOpen, Clock, Calendar, ShieldCheck, FileArchive, CheckCircle2, ClipboardList, Eye } from 'lucide-react';
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
}

export function BatchCard({ batch, onContinue, onClose, onArchive, onReopen, onActivate, onViewBooks, onViewAudit }: BatchCardProps) {
  const statusColor = batch.status === 'open' ? '#3b82f6' : batch.status === 'closed' ? '#10b981' : '#6b7280';

  return (
    <div className="admin-grid-card" style={{ padding: '20px', borderTop: `4px solid ${statusColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageOpen size={20} />
            {batch.name}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '4px' }}>{batch.description}</p>
        </div>
        <div>
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
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', fontSize: '0.875rem', color: '#4b5563' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} />
          {new Date(batch.opened_at).toLocaleDateString()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={16} />
          {batch.book_count || 0} Books
        </div>
      </div>

      <div className="admin-grid-card__actions" style={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
        <button className="admin-btn admin-btn--secondary" onClick={() => onViewBooks(batch.id)}>
          <Eye size={16} /> View Books
        </button>

        {/* View Audit — always available */}
        <button
          className="admin-btn admin-btn--secondary"
          title="View Audit Trail"
          style={{ color: '#6366f1' }}
          onClick={() => onViewAudit(batch)}
        >
          <ClipboardList size={16} /> View Audit
        </button>

        {batch.status === 'open' && (
          <>
            <button className="admin-btn admin-btn--primary" onClick={() => onContinue(batch.id)}>
              Continue
            </button>
            <button className="admin-btn admin-btn--secondary" onClick={() => onClose(batch.id)} style={{ color: '#b91c1c' }}>
              <CheckCircle2 size={16} /> Close Batch
            </button>
          </>
        )}

        {batch.status === 'closed' && (
          <>
            {!batch.is_display_batch && (
              <button className="admin-btn admin-btn--primary" onClick={() => onActivate(batch.id)}>
                Set as Display
              </button>
            )}
            <button className="admin-btn admin-btn--secondary" onClick={() => onArchive(batch.id)}>
              <FileArchive size={16} /> Archive
            </button>
            <button className="admin-btn admin-btn--secondary" onClick={() => onReopen(batch.id)}>
              Reopen
            </button>
          </>
        )}

        {batch.status === 'archived' && (
          <button className="admin-btn admin-btn--secondary" onClick={() => onReopen(batch.id)}>
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from 'lucide-react';
import { useExcelParser, ParsedSheet, ExcelParseResult } from '@/src/Hooks/useExcelParser';
import { referenceApi, SyncCommitResult, SyncDiff } from '@/src/Endpoints/referenceApi';
import { useToast } from '@/src/Hooks/useToast';
import { ChunkedSyncState } from '@/src/Hooks/useChunkedSync';

interface ExcelUploadModalProps {
  onClose: () => void;
  syncState: ChunkedSyncState;
  startSync: (diff: SyncDiff, applyDeletions: boolean) => Promise<void>;
  cancelSync: () => void;
}

type Step = 'upload' | 'preview' | 'diff' | 'result';

const DEPT_SHORT: Record<string, string> = {
  'Research of Bachelor of Science in Forestry (BSF)': 'BSF',
  'Research Books for Bachelor of Science in Computer Science': 'BSCS',
  'Research Books for Agri. Business Management': 'ABM',
  'Narrative Report of Secondary Education': 'Secondary Ed.',
};

export function ExcelUploadModal({ onClose, syncState, startSync, cancelSync }: ExcelUploadModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  
  // Use local state only if sync is not active/finished
  const [localSyncDiff, setLocalSyncDiff] = useState<SyncDiff | null>(null);
  const syncDiff = syncState.syncDiff || localSyncDiff;
  
  const [applyDeletions, setApplyDeletions] = useState(syncState.applyDeletions || false);
  const importResult = syncState.finalResult;
  const isImporting = syncState.isActive;
  
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { parseFile } = useExcelParser();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (syncState.isActive) setStep('diff');
    else if (syncState.finalResult) setStep('result');
  }, [syncState.isActive, syncState.finalResult]);

  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
        showToast('Please upload a valid .xlsx, .xls, or .csv file.', 'error');
        return;
      }
      setFileName(file.name);
      setIsParsing(true);
      try {
        const result = await parseFile(file);
        setParseResult(result);
        setStep('preview');
      } catch (err: any) {
        showToast(err.message || 'Failed to parse file.', 'error');
      } finally {
        setIsParsing(false);
      }
    },
    [parseFile, showToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!parseResult) return;
    setIsAnalyzing(true);
    try {
      const records = parseResult.sheets.flatMap((sheet) =>
        sheet.rows.map((row) => ({
          category: row.category,
          department: row.department ?? undefined,
          no: row.no ? parseInt(row.no) : null,
          acc_no: row.acc_no,
          call_number: row.call_number,
          title: row.title,
          author: row.author,
          copyright: row.copyright,
          remarks: row.remarks,
          inventory_year: row.inventory_year,
          resource_status: null,
        }))
      );

      const diff = await referenceApi.syncPreview(records);
      setLocalSyncDiff(diff);
      setStep('diff');
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze records.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSyncCommit = async () => {
    if (!syncDiff) return;
    try {
      await startSync(syncDiff, applyDeletions);
      // We don't close here, we let the background sync toast handle it,
      // and the step will automatically become 'result' when done via the useEffect.
    } catch (err: any) {
      showToast(err.message || 'Failed to start sync.', 'error');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-overlay z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Upload Excel / CSV</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Import research references from a spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
          {(['upload', 'preview', 'diff', 'result'] as Step[]).map((s, idx) => {
            const labels = ['1. Upload', '2. Preview', '3. Diff', '4. Result'];
            const isActive = step === s;
            const isDone =
              (s === 'upload' && step !== 'upload') ||
              (s === 'preview' && (step === 'diff' || step === 'result')) ||
              (s === 'diff' && step === 'result');
            return (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : isDone
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--color-primary)' } : {}}
                >
                  {isDone ? <CheckCircle2 size={14} /> : null}
                  {labels[idx]}
                </div>
                {idx < 3 && <ChevronRight size={14} className="text-gray-300 mx-1" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                }`}
                style={isDragging ? { borderColor: 'var(--color-primary)' } : {}}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                {isParsing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                    <p className="font-semibold text-gray-600">Parsing file...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-surface-container-low)' }}
                    >
                      <Upload size={28} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        Drag & drop your file here
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or <span className="font-bold" style={{ color: 'var(--color-primary)' }}>click to browse</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
                      Supports .xlsx, .xls, .csv — max 5,000 rows
                    </p>
                  </div>
                )}
              </div>

              {/* Column mapping guide */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Expected Column Headers
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['NO.', 'ACC. NO.', 'CALL NUMBER', 'TITLE', 'AUTHOR', 'COPYRIGHT', 'REMARKS', 'INVENTORY 2026'].map(
                    (col) => (
                      <span
                        key={col}
                        className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700"
                      >
                        {col}
                      </span>
                    )
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Sheet names are auto-detected: sheets with "Thesis" or "Dissertation" are imported as{' '}
                  <strong>Thesis and Dissertation</strong>; all others are imported as{' '}
                  <strong>Student Research</strong> with department auto-mapped.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 'preview' && parseResult && (
            <div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">{parseResult.totalRows}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-1">Total Rows</p>
                </div>
                <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: 'var(--color-surface-container-low)', borderColor: 'var(--color-outline-variant)' }}>
                  <p className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>{parseResult.sheets.length}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>Sheet(s) Detected</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center col-span-2 md:col-span-1">
                  <p className="text-2xl font-black text-amber-700">{parseResult.warnings.length}</p>
                  <p className="text-xs font-semibold text-amber-600 mt-1">Warning(s)</p>
                </div>
              </div>

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
                    <AlertTriangle size={16} /> Warnings
                  </div>
                  {parseResult.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-700 pl-6">
                      {w}
                    </p>
                  ))}
                </div>
              )}

              {/* File name */}
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                <FileSpreadsheet size={16} className="text-emerald-500" />
                {fileName}
              </div>

              {/* Sheet previews */}
              {parseResult.sheets.map((sheet) => (
                <React.Fragment key={sheet.sheetName}>
                  <SheetPreview sheet={sheet} />
                </React.Fragment>
              ))}
            </div>
          )}

          {/* STEP 3: DIFF REVIEW */}
          {step === 'diff' && syncDiff && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Database Sync Analysis</h3>
                <div className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                  Total Analyzed: {syncDiff.to_create.length + syncDiff.to_update.length + syncDiff.unchanged}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-emerald-700">{syncDiff.to_create.length}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1">New</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-blue-700">{syncDiff.to_update.length}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Updated</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-red-700">{syncDiff.to_delete.length}</p>
                  <p className="text-[10px] font-bold text-red-600 uppercase mt-1">Removed in File</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-gray-700">{syncDiff.unchanged}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Unchanged</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-700">Preview of Changes</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white sticky top-0 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2 font-bold text-gray-500">Status</th>
                        <th className="px-4 py-2 font-bold text-gray-500">Title</th>
                        <th className="px-4 py-2 font-bold text-gray-500">Department/Category</th>
                        <th className="px-4 py-2 font-bold text-gray-500">Changes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {syncDiff.to_create.map((r, i) => (
                        <tr key={`c-${i}`}>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded">New</span>
                          </td>
                          <td className="px-4 py-2 font-medium truncate max-w-[200px]">{r.title}</td>
                          <td className="px-4 py-2 text-gray-500 truncate max-w-[150px]">{DEPT_SHORT[r.department || ''] || r.category}</td>
                          <td className="px-4 py-2 text-gray-400">-</td>
                        </tr>
                      ))}
                      {syncDiff.to_update.map((r, i) => (
                        <tr key={`u-${i}`}>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded">Updated</span>
                          </td>
                          <td className="px-4 py-2 font-medium truncate max-w-[200px]">{r.title}</td>
                          <td className="px-4 py-2 text-gray-500 truncate max-w-[150px]">{DEPT_SHORT[r.department || ''] || r.category}</td>
                          <td className="px-4 py-2 text-blue-600 truncate max-w-[150px]">
                            {Object.keys(r.changes).join(', ')}
                          </td>
                        </tr>
                      ))}
                      {syncDiff.to_delete.map((r, i) => (
                        <tr key={`d-${i}`}>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-red-100 text-red-700 font-bold rounded">Removed</span>
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-500 truncate max-w-[200px] line-through">{r.title}</td>
                          <td className="px-4 py-2 text-gray-400 truncate max-w-[150px]">{DEPT_SHORT[r.department || ''] || r.department}</td>
                          <td className="px-4 py-2 text-gray-400">Missing from file</td>
                        </tr>
                      ))}
                      {syncDiff.to_create.length === 0 && syncDiff.to_update.length === 0 && syncDiff.to_delete.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500 font-medium">
                            No changes detected against the database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {syncDiff.to_delete.length > 0 && (
                <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                  <input
                    type="checkbox"
                    id="applyDeletions"
                    checked={applyDeletions}
                    onChange={(e) => setApplyDeletions(e.target.checked)}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <label htmlFor="applyDeletions" className="text-sm font-semibold text-red-900 cursor-pointer select-none">
                    Also remove {syncDiff.to_delete.length} deleted records from the database
                  </label>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: RESULT */}
          {step === 'result' && importResult && (
            <div className="space-y-5 text-center py-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                  (importResult.created > 0 || importResult.updated > 0 || importResult.deleted > 0) && importResult.errors.length === 0 ? 'bg-emerald-100' : 'bg-amber-100'
                }`}
              >
                {(importResult.created > 0 || importResult.updated > 0 || importResult.deleted > 0) && importResult.errors.length === 0 ? (
                  <CheckCircle2 size={40} className="text-emerald-600" />
                ) : (
                  <AlertTriangle size={40} className="text-amber-500" />
                )}
              </div>

              <div>
                <p className="text-2xl font-black text-gray-900">
                  Sync Completed
                </p>
                <div className="flex justify-center gap-4 mt-3">
                  <span className="text-sm font-bold text-emerald-600">{importResult.created} Created</span>
                  <span className="text-sm font-bold text-blue-600">{importResult.updated} Updated</span>
                  <span className="text-sm font-bold text-red-600">{importResult.deleted} Deleted</span>
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  {importResult.errors.length === 0
                    ? 'All changes applied successfully without errors.'
                    : `${importResult.errors.length} operation(s) had errors.`}
                </p>
              </div>

              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-left space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Errors</p>
                  {importResult.errors.map((e, i) => (
                    <div key={i} className="text-xs text-red-700">
                      <span className="font-bold">Row {e.row}:</span> {e.title || '(no title)'} —{' '}
                      {typeof e.error === 'object' ? JSON.stringify(e.error) : e.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center shrink-0 bg-gray-50">
          {syncState.isActive ? (
            <button
              onClick={cancelSync}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 border border-red-700 rounded-xl hover:bg-red-700 transition-all cursor-pointer shadow-sm"
            >
              Cancel Sync
            </button>
          ) : (
            <button
              onClick={step === 'upload' ? onClose : () => setStep(
                step === 'result' ? 'upload' : 
                step === 'diff' ? 'preview' : 'upload'
              )}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
            >
              {step === 'upload' ? 'Cancel' : <><ChevronLeft size={16} /> Back</>}
            </button>
          )}

          {step === 'upload' && null}

          {step === 'preview' && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || parseResult!.totalRows === 0}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isAnalyzing ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
              ) : (
                <>Analyze Differences <ChevronRight size={16} /></>
              )}
            </button>
          )}

          {step === 'diff' && (
            <button
              onClick={handleSyncCommit}
              disabled={isImporting || (syncDiff?.to_create.length === 0 && syncDiff?.to_update.length === 0 && (!applyDeletions || syncDiff?.to_delete.length === 0))}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isImporting ? (
                <><Loader2 size={16} className="animate-spin" /> Syncing ({syncState.processedRecords} / {syncState.totalRecords})...</>
              ) : (
                <><CheckCircle2 size={16} /> Confirm & Sync</>
              )}
            </button>
          )}

          {step === 'result' && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all cursor-pointer"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Done <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Sub-component: collapsible sheet preview table */
const SheetPreview: React.FC<{ sheet: ParsedSheet }> = ({ sheet }) => {
  const [expanded, setExpanded] = useState(false);
  const previewRows = expanded ? sheet.rows : sheet.rows.slice(0, 5);

  const DEPT_SHORT: Record<string, string> = {
    'Research of Bachelor of Science in Forestry (BSF)': 'BSF',
    'Research Books for Bachelor of Science in Computer Science': 'BSCS',
    'Research Books for Agri. Business Management': 'ABM',
    'Narrative Report of Secondary Education': 'Secondary Ed.',
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <FileSpreadsheet size={16} className="text-emerald-500" />
          <span className="font-bold text-sm text-gray-800">{sheet.sheetName}</span>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              sheet.category === 'Thesis and Dissertation'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {sheet.category === 'Thesis and Dissertation'
              ? 'Thesis & Dissertation'
              : sheet.department
              ? DEPT_SHORT[sheet.department] ?? sheet.department
              : 'Research'}
          </span>
        </div>
        <span className="text-xs font-semibold text-gray-500">{sheet.rows.length} rows</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-white border-b border-gray-100">
              {['No.', 'Acc No.', 'Call Number', 'Title', 'Author', 'Copyright'].map((h) => (
                <th key={h} className="px-4 py-2.5 font-bold text-gray-600 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {previewRows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5 text-gray-500">{row.no ?? '-'}</td>
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.acc_no ?? '-'}</td>
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.call_number ?? '-'}</td>
                <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[200px] truncate">{row.title}</td>
                <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{row.author ?? '-'}</td>
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{row.copyright ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sheet.rows.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 text-xs font-semibold text-center transition-colors bg-gray-50 hover:bg-gray-100 cursor-pointer border-t border-gray-100"
          style={{ color: 'var(--color-primary)' }}
        >
          {expanded ? 'Show less' : `Show all ${sheet.rows.length} rows`}
        </button>
      )}
    </div>
  );
}

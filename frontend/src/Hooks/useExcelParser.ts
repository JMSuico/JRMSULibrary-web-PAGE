import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { ResearchDepartment, RESEARCH_DEPARTMENTS } from '@/src/Endpoints/referenceApi';

export interface ParsedRow {
  no: string | null;
  acc_no: string | null;
  call_number: string | null;
  title: string;
  author: string | null;
  copyright: string | null;
  remarks: string | null;
  inventory_year: string | null;
  // Derived from sheet name
  category: 'Research for College Student in JRMSU' | 'Thesis and Dissertation';
  department: ResearchDepartment | null;
}

export interface ParsedSheet {
  sheetName: string;
  category: 'Research for College Student in JRMSU' | 'Thesis and Dissertation';
  department: ResearchDepartment | null;
  rows: ParsedRow[];
}

export interface ExcelParseResult {
  sheets: ParsedSheet[];
  totalRows: number;
  warnings: string[];
}

// Column header aliases (normalised lowercase) → model field
const COLUMN_MAP: Record<string, string> = {
  'no': 'no',
  'no.': 'no',
  'acc no': 'acc_no',
  'acc. no': 'acc_no',
  'acc. no.': 'acc_no',
  'acc no.': 'acc_no',
  'accession no': 'acc_no',
  'accession no.': 'acc_no',
  'call number': 'call_number',
  'call no': 'call_number',
  'call no.': 'call_number',
  'call number.': 'call_number',
  'title': 'title',
  'author': 'author',
  'copyright': 'copyright',
  'remarks': 'remarks',
  'inventory 2026': 'inventory_year',
  'inventory': 'inventory_year',
  'inventory year': 'inventory_year',
};

/** Department keyword hints in sheet names → department value */
const DEPT_KEYWORDS: { keywords: string[]; value: ResearchDepartment }[] = [
  {
    keywords: ['bsf', 'forestry'],
    value: 'Research of Bachelor of Science in Forestry (BSF)',
  },
  {
    keywords: ['bscs', 'computer science', 'compsci'],
    value: 'Research Books for Bachelor of Science in Computer Science',
  },
  {
    keywords: ['abm', 'agri', 'agricultural', 'agribusiness'],
    value: 'Research Books for Agri. Business Management',
  },
  {
    keywords: ['secondary', 'narrative', 'education'],
    value: 'Narrative Report of Secondary Education',
  },
];

function detectSheetMeta(
  sheetName: string
): { category: ParsedRow['category']; department: ResearchDepartment | null } {
  const lower = sheetName.toLowerCase();

  if (lower.includes('thesis') || lower.includes('dissertation')) {
    return { category: 'Thesis and Dissertation', department: null };
  }

  for (const { keywords, value } of DEPT_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) {
      return { category: 'Research for College Student in JRMSU', department: value };
    }
  }

  // Fallback: treat as student research with no dept
  return { category: 'Research for College Student in JRMSU', department: null };
}

function normalise(header: string): string {
  return header
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function mapRow(
  rawRow: Record<string, any>,
  headers: string[],
  meta: { category: ParsedRow['category']; department: ResearchDepartment | null }
): ParsedRow | null {
  const mapped: Record<string, any> = {};

  for (const header of headers) {
    const normHeader = normalise(header);
    const field = COLUMN_MAP[normHeader];
    if (field) {
      const val = rawRow[header];
      mapped[field] = val !== undefined && val !== null && val !== '' ? String(val).trim() : null;
    }
  }

  // title is required
  if (!mapped['title']) return null;

  return {
    no: mapped['no'] ?? null,
    acc_no: mapped['acc_no'] ?? null,
    call_number: mapped['call_number'] ?? null,
    title: mapped['title'],
    author: mapped['author'] ?? null,
    copyright: mapped['copyright'] ?? null,
    remarks: mapped['remarks'] ?? null,
    inventory_year: mapped['inventory_year'] ?? null,
    category: meta.category,
    department: meta.department,
  };
}

export function useExcelParser() {
  const parseFile = useCallback((file: File): Promise<ExcelParseResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });

          const sheets: ParsedSheet[] = [];
          const warnings: string[] = [];
          let totalRows = 0;

          for (const sheetName of workbook.SheetNames) {
            const ws = workbook.Sheets[sheetName];
            // Read as 2D array to find the true header row
            const rawArray: any[][] = XLSX.utils.sheet_to_json(ws, {
              header: 1,
              defval: null,
              raw: false,
            });

            if (rawArray.length === 0) {
              warnings.push(`Sheet "${sheetName}" is empty and was skipped.`);
              continue;
            }

            // Find the true header row (scan first 15 rows)
            let headerRowIdx = -1;
            let headers: string[] = [];
            
            for (let i = 0; i < Math.min(15, rawArray.length); i++) {
              const rowData = rawArray[i];
              if (!Array.isArray(rowData)) continue;
              
              const strRow = rowData.map(c => String(c || '').toLowerCase().trim());
              // Look for common headers
              if (strRow.includes('title') || strRow.includes('no.') || strRow.includes('no') || strRow.includes('author')) {
                headerRowIdx = i;
                headers = rowData.map(c => String(c || '').trim());
                break;
              }
            }

            if (headerRowIdx === -1) {
              warnings.push(`Sheet "${sheetName}": could not detect column headers (missing TITLE/NO.).`);
              continue;
            }

            const meta = detectSheetMeta(sheetName);
            const parsedRows: ParsedRow[] = [];
            
            // Process rows below the header
            for (let i = headerRowIdx + 1; i < rawArray.length; i++) {
              const rawData = rawArray[i];
              if (!Array.isArray(rawData) || rawData.length === 0) continue;
              
              // Build object mapping
              const rawRow: Record<string, any> = {};
              for (let col = 0; col < headers.length; col++) {
                if (headers[col]) {
                  rawRow[headers[col]] = rawData[col];
                }
              }

              const row = mapRow(rawRow, headers, meta);
              if (row) {
                parsedRows.push(row);
              }
            }

            if (parsedRows.length === 0) {
              warnings.push(`Sheet "${sheetName}": no valid rows found (title column is required).`);
              continue;
            }

            sheets.push({
              sheetName,
              category: meta.category,
              department: meta.department,
              rows: parsedRows,
            });
            totalRows += parsedRows.length;
          }

          resolve({ sheets, totalRows, warnings });
        } catch (err: any) {
          reject(new Error(`Failed to parse file: ${err.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  return { parseFile };
}

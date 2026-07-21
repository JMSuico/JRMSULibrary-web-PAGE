import React, { useState, useEffect } from 'react';
import { FileText, Printer, Calendar as CalendarIcon, Download, Search, Eye, History, X, ChevronLeft, ChevronRight, Loader2, Archive, Trash2 } from 'lucide-react';
import { reportApi, ReportSummary, HistoricalReport } from '@/src/Endpoints/reportApi';
import { useToast } from '@/src/Hooks/useToast';
import { useDebounce } from '@/src/Hooks/useDebounce';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dynamicAxis, extractValues } from '@/src/Libs/chartUtils';
import { Pagination } from '@/src/Components/Shared/Pagination';
import { useUndoDelete } from '@/src/Hooks/useUndoDelete';
import { UndoDeleteToast } from '@/src/Components/Shared/UndoDeleteToast';

export function Reports() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('this-month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [activeReportInfo, setActiveReportInfo] = useState<{title: string, period: string, type: string} | null>(null);
  
  // History Table State
  const [history, setHistory] = useState<HistoricalReport[]>([]);
  const [totalHistory, setTotalHistory] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const limit = 5;

  const debouncedSearch = useDebounce(searchQuery, 400);
  const { showToast } = useToast();

  const handleArchive = async (id: number) => {
    try {
      await reportApi.archiveReport(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      showToast('Report archived successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to archive report', 'error');
    }
  };

  const { undoState, triggerDelete, cancelDelete, executeNow } = useUndoDelete();

  const handleDelete = (id: number) => {
    const reportToDelete = history.find(h => h.id === id);
    if (!reportToDelete) return;
    
    triggerDelete(
      `Report "${reportToDelete.title}"`,
      async () => {
        try {
          await reportApi.deleteReport(id);
        } catch (err: any) {
          setHistory(prev => [...prev, reportToDelete]);
          showToast('Failed to permanently delete report', 'error');
        }
      },
      () => {
        setHistory(prev => [...prev, reportToDelete].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        showToast('Report restoration undone', 'success');
      }
    );

    // Optimistically hide it from UI
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const offset = (page - 1) * limit;
      const res = await reportApi.getHistory(debouncedSearch, limit, offset);
      setHistory(res.results);
      setTotalHistory(res.total);
    } catch (err: any) {
      showToast('Failed to load report history', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, debouncedSearch]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await reportApi.generate(reportType, dateRange);
      setReportData(res.data);
      setActiveReportInfo({ title: `Report - ${dateRange.replace('-', ' ').toUpperCase()}`, period: dateRange, type: reportType });
      showToast('Report generated successfully', 'success');
      setPage(1);
      fetchHistory();
      setTimeout(() => {
        document.getElementById('report-preview-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate report', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewHistorical = async (id: number) => {
    try {
      const res = await reportApi.getHistoryDetail(id);
      setReportData(res.data);
      setActiveReportInfo({ title: res.title, period: res.date_range, type: res.report_type });
      setTimeout(() => {
        document.getElementById('report-preview-area')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      showToast('Failed to load report details', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportPdf = async () => {
    const el = document.getElementById('report-preview-area');
    if (!el) return;

    let clone: HTMLElement | null = null;
    try {
      setIsPdfGenerating(true);
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas-pro'),
      ]);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Fix for html2canvas failing on CSS variables (var(--color-navy))
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas rendering failed (zero width/height).');
      }
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      const rPeriod = activeReportInfo?.period || dateRange;
      pdf.save(`jrmsu-library-report-${rPeriod}-${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast('PDF downloaded successfully', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to generate PDF: ' + err.message, 'error');
    } finally {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      setIsPdfGenerating(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    const rows: string[][] = [];
    rows.push(['JRMSU Katipunan Campus Library - Report']);
    const rType = activeReportInfo?.type || reportType;
    const rPeriod = activeReportInfo?.period || dateRange;
    rows.push([`Report Type: ${rType}`, `Period: ${rPeriod.replace('-', ' ').toUpperCase()}`]);
    rows.push([]);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Visits', String(reportData.total_visits)]);
    rows.push(['Total Books', String(reportData.total_books)]);
    rows.push(['Total Emails', String(reportData.total_emails)]);
    rows.push(['Total Reservations', String(reportData.total_reservations)]);
    rows.push(['Average Rating', `${reportData.ratings_summary.average_rating} / 5`]);
    rows.push([]);

    if (reportData.recent_books.length > 0) {
      rows.push(['Book Acquisitions in Period']);
      rows.push(['Title', 'Author', 'Category', 'Date Added']);
      reportData.recent_books.forEach(b => {
        rows.push([b.title, b.author, b.category, b.dateAdded]);
      });
      rows.push([]);
    }

    if (reportData.recent_activity.length > 0) {
      rows.push(['User Interactions in Period']);
      rows.push(['Type', 'Name', 'Date']);
      reportData.recent_activity.forEach(a => {
        rows.push([a.type, a.name, new Date(a.date).toLocaleDateString()]);
      });
    }

    const csvContent = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jrmsu-library-report-${rPeriod}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully', 'success');
  };

  const ratingData = reportData ? [
    { name: '1 Star', count: reportData.ratings_summary.distribution[1] || 0 },
    { name: '2 Stars', count: reportData.ratings_summary.distribution[2] || 0 },
    { name: '3 Stars', count: reportData.ratings_summary.distribution[3] || 0 },
    { name: '4 Stars', count: reportData.ratings_summary.distribution[4] || 0 },
    { name: '5 Stars', count: reportData.ratings_summary.distribution[5] || 0 },
  ] : [];

  const interactionData = reportData ? [
    { name: 'Emails', value: reportData.total_emails },
    { name: 'Reservations', value: reportData.total_reservations }
  ] : [];
  const COLORS = ['#2563eb', '#0d9488'];

  return (
    <>
      <div className="admin-content__header flex justify-between items-end print:hidden">
        <div>
          <h1 className="flex items-center gap-2"><FileText size={28} /> Document Reports</h1>
          <p>Generate, export, and print official library reports.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 print:hidden">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Report Generator</h2>
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Report Type</label>
            <select 
              value={reportType} 
              onChange={e => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy"
            >
              <option value="summary">Comprehensive Summary</option>
              <option value="visitors">Visitor Analytics</option>
              <option value="books">Acquired Books</option>
              <option value="interactions">Emails & Reservations</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date Range</label>
            <select 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy"
            >
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-year">This Year</option>
              <option value="all-time">All Time</option>
            </select>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="admin-btn admin-btn--primary w-full md:w-auto justify-center whitespace-nowrap disabled:opacity-70"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 print:hidden">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><History size={20} /> Generated Reports History</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-navy w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Date Range</th>
                <th>Generated By</th>
                <th>Generated At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingHistory ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <Loader2 className="animate-spin text-navy mx-auto mb-2" size={24} />
                    <p className="text-gray-500 text-sm">Loading history...</p>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No reports found. Generate a new report above!
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id}>
                    <td className="font-medium text-gray-900">{h.title}</td>
                    <td><span className="bg-blue-50 text-navy px-2 py-1 rounded-md text-xs font-semibold uppercase">{h.report_type}</span></td>
                    <td>{h.date_range.replace('-', ' ').toUpperCase()}</td>
                    <td>{h.generated_by}</td>
                    <td>{new Date(h.generated_at).toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewHistorical(h.id)}
                          className="admin-btn admin-btn--outline flex items-center gap-1 !py-1 !px-2 text-xs"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleArchive(h.id)}
                          className="admin-btn admin-btn--outline flex items-center gap-1 !py-1 !px-2 text-xs text-gray-600 hover:text-navy hover:bg-blue-50 border-gray-200"
                          title="Archive"
                        >
                          <Archive size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="admin-btn admin-btn--outline flex items-center gap-1 !py-1 !px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalHistory > limit && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalHistory / limit)}
              onPageChange={setPage}
              totalItems={totalHistory}
              itemsPerPage={limit}
            />
          </div>
        )}
      </div>
      
      {reportData && (
        <div className="bg-white border border-gray-200 shadow-sm p-8 rounded-none md:rounded-2xl print:border-none print:shadow-none print:p-0 mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
          
          <div className="flex justify-between items-start mb-8 print:hidden">
            <h3 className="text-xl font-bold text-gray-800">Report Preview</h3>
            <div className="flex gap-2">
              <button onClick={() => setReportData(null)} className="admin-btn admin-btn--outline text-gray-500 flex items-center gap-2">
                <X size={16} /> Close
              </button>
              <button onClick={handleExportCSV} className="admin-btn admin-btn--outline flex items-center gap-2">
                <Download size={16} /> Export CSV
              </button>
              <button onClick={exportPdf} disabled={isPdfGenerating} className="admin-btn admin-btn--primary flex items-center gap-2 bg-red-600 hover:bg-red-700 border-none text-white disabled:opacity-60">
                {isPdfGenerating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : 'Export as PDF'}
              </button>
              <button onClick={handlePrint} className="admin-btn admin-btn--primary flex items-center gap-2">
                <Printer size={16} /> Print
              </button>
            </div>
          </div>

          {/* Printable Area */}
          <div id="report-preview-area" className="print-area font-serif text-gray-800 bg-white p-8">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-2xl font-bold uppercase">Jose Rizal Memorial State University</h1>
              <h2 className="text-xl">Katipunan Campus Library</h2>
              <p className="mt-2 text-sm font-sans">Official System Report: {activeReportInfo?.title || reportType}</p>
              <p className="text-sm font-sans">Period: {(activeReportInfo?.period || dateRange).replace('-', ' ').toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {(() => {
                const currentType = activeReportInfo?.type || reportType;
                return (
                  <>
                    {(currentType === 'summary' || currentType === 'visitors') && (
                      <div className="border border-gray-300 p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">Total Visits</p>
                        <p className="text-2xl font-bold font-sans">{reportData.total_visits}</p>
                      </div>
                    )}
                    {(currentType === 'summary' || currentType === 'books') && (
                      <div className="border border-gray-300 p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">Books Acquired</p>
                        <p className="text-2xl font-bold font-sans">{reportData.total_books}</p>
                      </div>
                    )}
                    {(currentType === 'summary' || currentType === 'interactions') && (
                      <div className="border border-gray-300 p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">Emails Processed</p>
                        <p className="text-2xl font-bold font-sans">{reportData.total_emails}</p>
                      </div>
                    )}
                    {(currentType === 'summary' || currentType === 'visitors') && (
                      <div className="border border-gray-300 p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 font-sans">Avg Rating</p>
                        <p className="text-2xl font-bold font-sans">{reportData.ratings_summary.average_rating} / 5</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 break-inside-avoid">
              {(() => {
                const currentType = activeReportInfo?.type || reportType;
                return (
                  <>
                    {(currentType === 'summary' || currentType === 'visitors') && (
                      <div className="border border-gray-300 p-4">
                          <h4 className="text-sm font-bold uppercase tracking-wider font-sans mb-4 text-center">Feedback Ratings Breakdown</h4>
                          <div className="h-64">
                            {(() => {
                              const ya = dynamicAxis(extractValues(ratingData, 'count'));
                              return (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={ratingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis domain={ya.domain} ticks={ya.ticks} allowDecimals={false} fontSize={12} />
                                    <RechartsTooltip />
                                    <Bar dataKey="count" fill='#C9A84C' />
                                  </BarChart>
                                </ResponsiveContainer>
                              );
                            })()}
                          </div>
                      </div>
                    )}
                    {(currentType === 'summary' || currentType === 'interactions') && (
                      <div className="border border-gray-300 p-4">
                          <h4 className="text-sm font-bold uppercase tracking-wider font-sans mb-4 text-center">Interactions Overview</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={interactionData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={80}
                                  fill="#4f46e5"
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {interactionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {(activeReportInfo?.type === 'summary' || activeReportInfo?.type === 'books' || (!activeReportInfo && (reportType === 'summary' || reportType === 'books'))) && (
              <div className="mb-8">
                <h4 className="text-lg font-bold border-b border-gray-300 mb-2 font-sans">Book Acquisitions in Period</h4>
                <table className="w-full text-left text-sm border-collapse font-sans">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Title</th>
                      <th className="border border-gray-300 p-2">Author</th>
                      <th className="border border-gray-300 p-2">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.recent_books.map((b) => (
                      <tr key={b.id} className="break-inside-avoid">
                        <td className="border border-gray-300 p-2">{b.title}</td>
                        <td className="border border-gray-300 p-2">{b.author}</td>
                        <td className="border border-gray-300 p-2">{b.dateAdded}</td>
                      </tr>
                    ))}
                    {reportData.recent_books.length === 0 && (
                      <tr><td colSpan={3} className="border border-gray-300 p-2 text-center text-gray-500">No recent books.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {(activeReportInfo?.type === 'summary' || activeReportInfo?.type === 'interactions' || (!activeReportInfo && (reportType === 'summary' || reportType === 'interactions'))) && (
              <div className="mb-8">
                <h4 className="text-lg font-bold border-b border-gray-300 mb-2 font-sans">User Interactions in Period</h4>
                <table className="w-full text-left text-sm border-collapse font-sans">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Type</th>
                      <th className="border border-gray-300 p-2">Name</th>
                      <th className="border border-gray-300 p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.recent_activity.map((act) => (
                      <tr key={act.id} className="break-inside-avoid">
                        <td className="border border-gray-300 p-2">{act.type}</td>
                        <td className="border border-gray-300 p-2">{act.name}</td>
                        <td className="border border-gray-300 p-2">{new Date(act.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {reportData.recent_activity.length === 0 && (
                      <tr><td colSpan={3} className="border border-gray-300 p-2 text-center text-gray-500">No recent interactions.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-16 text-center text-sm text-gray-500 font-sans">
              <p>Generated by JRMSU Library Admin System</p>
              <p>Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}
      <UndoDeleteToast 
        undoState={undoState} 
        onUndo={cancelDelete} 
        onExecuteNow={executeNow} 
      />
    </>
  );
}



import React, { useState } from 'react';
import { FileText, Printer, Calendar as CalendarIcon, Download } from 'lucide-react';
import { reportApi, ReportSummary } from '@/src/Endpoints/reportApi';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('this-month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportSummary | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // In a real app, we would pass dateRange and reportType as query params.
      // For now, we reuse the summary endpoint to get the data to print.
      const data = await reportApi.getSummary();
      setReportData(data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Report Type</label>
            <select 
              value={reportType} 
              onChange={e => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#002B7F]"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#002B7F]"
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
            className="admin-btn admin-btn--primary whitespace-nowrap disabled:opacity-70"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="bg-white border border-gray-200 shadow-sm p-8 rounded-none md:rounded-2xl print:border-none print:shadow-none print:p-0">
          
          <div className="flex justify-between items-start mb-8 print:hidden">
            <h3 className="text-xl font-bold text-gray-800">Preview</h3>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="admin-btn admin-btn--outline flex items-center gap-2">
                <Printer size={16} /> Print
              </button>
              <button onClick={handlePrint} className="admin-btn admin-btn--primary flex items-center gap-2">
                <Download size={16} /> Save PDF
              </button>
            </div>
          </div>

          {/* Printable Area */}
          <div className="print-area font-serif text-gray-800">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="text-2xl font-bold uppercase">Jose Rizal Memorial State University</h1>
              <h2 className="text-xl">Katipunan Campus Library</h2>
              <p className="mt-2 text-sm">Official System Report: {reportType === 'summary' ? 'Comprehensive Summary' : reportType}</p>
              <p className="text-sm">Period: {dateRange.replace('-', ' ').toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="border border-gray-300 p-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Visits</p>
                <p className="text-3xl font-bold">{reportData.total_visits}</p>
              </div>
              <div className="border border-gray-300 p-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Books Acquired</p>
                <p className="text-3xl font-bold">{reportData.total_books}</p>
              </div>
              <div className="border border-gray-300 p-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Emails Processed</p>
                <p className="text-3xl font-bold">{reportData.total_emails}</p>
              </div>
              <div className="border border-gray-300 p-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Rating</p>
                <p className="text-3xl font-bold">{reportData.ratings_summary.average_rating} / 5</p>
              </div>
            </div>

            {(reportType === 'summary' || reportType === 'books') && (
              <div className="mb-8 break-inside-avoid">
                <h4 className="text-lg font-bold border-b border-gray-300 mb-2">Recent Book Acquisitions</h4>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Title</th>
                      <th className="border border-gray-300 p-2">Author</th>
                      <th className="border border-gray-300 p-2">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.recent_books.map((b) => (
                      <tr key={b.id}>
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

            {(reportType === 'summary' || reportType === 'interactions') && (
              <div className="mb-8 break-inside-avoid">
                <h4 className="text-lg font-bold border-b border-gray-300 mb-2">Recent User Interactions</h4>
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2">Type</th>
                      <th className="border border-gray-300 p-2">Name</th>
                      <th className="border border-gray-300 p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.recent_activity.map((act) => (
                      <tr key={act.id}>
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

            <div className="mt-16 text-center text-sm text-gray-500">
              <p>Generated by JRMSU Library Admin System</p>
              <p>Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BarChart3, Users, BookOpen, Mail, CalendarDays, Star, TrendingUp, Activity, RefreshCw, Info, FileDown, Loader2 } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MetricCard } from "@/src/Features/Admin/components/MetricCard";
import { reportApi, ReportSummary } from "@/src/Endpoints/reportApi";
import { useToast } from "@/src/Hooks/useToast";
import { dynamicAxis, extractValues } from "@/src/Libs/chartUtils";

const NAVY='#002B7F',GOLD='#C9A84C',TEAL="#0d9488",ROSE="#e11d48",VIOLET="#7c3aed";
const PIE_COLORS=[ROSE,"#f97316","#f59e0b",TEAL,NAVY];
const TS={borderRadius:10,border:"none",boxShadow:`0 4px 12px rgba(0,0,0,0.25)`};

function avgRating(dist:Record<number,number>):number{let s=0,c=0;for(let i=1;i<=5;i++){s+=(dist[i]??0)*i;c+=(dist[i]??0);}return c===0?0:Math.round(s/c*100)/100;}
function engRate(e:number,r:number,v:number):string{return v===0?"0%":((e+r)/v*100).toFixed(1)+"%";}
function growth(t:{books:number}[]):string{if(t.length<2)return"N/A";const p=t[t.length-2].books,c=t[t.length-1].books;if(p===0)return c>0?"+inf%":"0%";const g=(c-p)/p*100;return(g>=0?"+":"")+g.toFixed(1)+"%";}
function sat(dist:Record<number,number>,tot:number):string{return tot===0?"0%":(((dist[5]??0)+(dist[4]??0))/tot*100).toFixed(0)+"%";}

function ChartCard({title,subtitle,icon,children,formula}:{title:string;subtitle?:string;icon:React.ReactNode;children:React.ReactNode;formula?:string}){
  const [f,setF]=useState(false);
  return(
    <div className="chart-card-print bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-navy">{icon}</span>
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          {formula&&<button onClick={()=>setF(v=>!v)} className="text-gray-400 hover:text-navy cursor-pointer" aria-label="formula"><Info size={14}/></button>}
        </div>
        {subtitle&&<p className="text-xs text-gray-500">{subtitle}</p>}
        {f&&formula&&<div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100"><p className="text-xs font-mono text-blue-700">{formula}</p></div>}
      </div>
      {children}
    </div>
  );
}

export function Analytics(){
  const [data,setData]=useState<ReportSummary|null>(null);
  const [loading,setLoading]=useState(true);
  const [isPdfGenerating,setIsPdfGenerating]=useState(false);
  const [last,setLast]=useState<Date>(new Date());
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  const{showToast}=useToast();
  
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackView, setFeedbackView] = useState<'card' | 'table'>('card');
  const [feedbackSort, setFeedbackSort] = useState<'desc' | 'asc'>('desc');
  const [feedbackStarFilter, setFeedbackStarFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');

  const load=async()=>{try{const s=await reportApi.getSummary();setData(s);setLast(new Date());}catch(e:any){showToast(e.message||"Failed","error");}finally{setLoading(false);}};
  useEffect(()=>{load();ref.current=setInterval(load,30000);return()=>{if(ref.current)clearInterval(ref.current);};},[]);

  const exportPdf = useCallback(async () => {
    if (isPdfGenerating) return;
    try {
      setIsPdfGenerating(true);
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas-pro')
      ]);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentW = pageW - margin * 2;

      const sectionIds = [
        'pdf-section-visits',
        'pdf-section-books-timeline',
        'pdf-section-engagement',
        'pdf-section-ratings-dist',
        'pdf-section-scatter',
        'pdf-section-combined',
      ];
      const titles = [
        'Site Visits Monthly',
        'Books Acquired Timeline',
        'Engagement Breakdown',
        'Ratings Distribution Curve',
        'Visits vs Books (Scatter)',
        'Combined Trend',
      ];
      const descriptions = [
        'Monthly trend of unique site visits over the last 6 months.',
        'Timeline of newly acquired books encoded into the system per month.',
        'Proportion of direct emails versus book reservations out of total user engagement.',
        'Distribution of user satisfaction ratings from 1 to 5 stars.',
        'Correlation between monthly site visits and books acquired (latest month in gold).',
        'Combined view comparing site visits (bar) against books acquired (line) across 6 months.',
      ];

      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (!el) continue;

        if (i > 0) pdf.addPage();

        pdf.setFillColor(0, 43, 127);
        pdf.rect(0, 0, pageW, 14, 'F');
        pdf.setTextColor(201, 168, 76);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('JRMSU Katipunan Campus Library — Analytics Report', margin, 9);
        pdf.setTextColor(180, 180, 180);
        pdf.setFontSize(7);
        pdf.text(dateStr, pageW - margin, 9, { align: 'right' });

        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(titles[i], margin, 22);

        // Add Description
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(descriptions[i], margin, 27);

        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });

        const imgData = canvas.toDataURL('image/png');
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas rendering failed (zero width/height).');
        }
        const imgH = (canvas.height / canvas.width) * contentW;
        const maxImgH = pageH - 40;
        const finalH = Math.min(imgH, maxImgH);
        pdf.addImage(imgData, 'PNG', margin, 32, contentW, finalH);

        pdf.setFontSize(7);
        pdf.setTextColor(160, 160, 160);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i + 1} of ${sectionIds.length}`, pageW / 2, pageH - 6, { align: 'center' });
      }

      pdf.save(`JRMSU-Library-Analytics-${now.toISOString().slice(0,10)}.pdf`);
      showToast('PDF saved successfully', 'success');
    } catch (err: any) {
      showToast('Failed to generate PDF: ' + (err.message || err), 'error');
    } finally {
      setIsPdfGenerating(false);
    }
  }, [isPdfGenerating, showToast]);

  const stars=(n:number)=>Array.from({length:5},(_,i)=><Star key={i} size={14} className={i<n?"text-gold fill-gold":"text-gray-300"}/>);

  if(loading&&!data)return(<div className="flex flex-col items-center justify-center py-24 gap-3"><div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"/><p className="text-gray-500 text-sm">Loading analytics...</p></div>);
  if(!data)return null;

  const trend=data.trend_data??[];
  const dist=data.ratings_summary.distribution;
  const ar=avgRating(dist);
  const eng=engRate(data.total_emails,data.total_reservations,data.total_visits);
  const gr=growth(trend);
  const sc=sat(dist,data.ratings_summary.total_ratings);
  const rp=[1,2,3,4,5].map(s=>({name:s+" Star",value:dist[s]??0}));
  const mp=[{name:"Emails",value:data.total_emails},{name:"Reservations",value:data.total_reservations}];

  return(
    <>
      <div className="admin-content__header flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1>Analytics</h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5"><Activity size={12} className="text-green-500 animate-pulse"/>Real-time · {last.toLocaleTimeString()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={()=>window.print()} className="admin-btn admin-btn--secondary flex items-center gap-2 print:hidden" style={{ borderColor: 'var(--color-navy)', color: 'var(--color-navy)' }}>
            Print Report
          </button>
          <button onClick={exportPdf} disabled={isPdfGenerating} className="admin-btn admin-btn--primary flex items-center gap-2 print:hidden bg-red-600 hover:bg-red-700 border-none text-white disabled:opacity-60">
            {isPdfGenerating ? (
              <><Loader2 size={14} className="animate-spin"/> Generating...</>
            ) : (
              <><FileDown size={14}/> Export as PDF</>
            )}
          </button>
        </div>
      </div>

      <div id="pdf-section-metrics" className="admin-metrics">
        <MetricCard label="Total Site Visits" value={data.total_visits} icon={<Users size={22}/>} variant="blue"/>
        <MetricCard label="Books Acquired" value={data.total_books} icon={<BookOpen size={22}/>} variant="green"/>
        <MetricCard label="Emails Received" value={data.total_emails} icon={<Mail size={22}/>} variant="orange"/>
        <MetricCard label="Reservations" value={data.total_reservations} icon={<CalendarDays size={22}/>} variant="purple"/>
        <MetricCard label="Total Ratings" value={data.ratings_summary.total_ratings} icon={<Star size={22}/>} variant="gold"/>
        <MetricCard label="Average Rating" value={`${ar} / 5`} icon={<Star size={22}/>} variant="gold"/>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {[{l:"Engagement Rate",v:eng,f:"(Emails+Res)/Visits x100",c:"text-teal-600 bg-teal-50 border-teal-100"},{l:"Books Growth",v:gr,f:"(Curr-Prev)/Prev x100",c:"text-blue-600 bg-blue-50 border-blue-100"},{l:"Satisfaction",v:sc,f:"(4*+5*)/Total x100",c:"text-amber-600 bg-amber-50 border-amber-100"},{l:"Weighted Avg",v:String(ar),f:"Sum(s*cnt)/Sum(cnt)",c:"text-rose-600 bg-rose-50 border-rose-100"}].map(k=>(
          <div key={k.l} className={`rounded-xl border p-4 ${k.c}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{k.l}</p>
            <p className="text-2xl font-bold mt-1">{k.v}</p>
            <p className="text-xs mt-1 font-mono opacity-60">{k.f}</p>
          </div>
        ))}
      </div>

      <div className="admin-table-wrapper mt-6 p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={24} className="text-navy"/>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Advanced Analytics Trends</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Activity size={11} className="text-green-500 animate-pulse"/> Auto-updates every 30s</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div id="pdf-section-visits">
          <ChartCard title="Site Visits Monthly" subtitle="Bar chart — last 6 months" icon={<Users size={16}/>} formula="total_visits = COUNT(SiteVisit) per month">
            {(()=>{const ya=dynamicAxis(extractValues(trend,'visits'));return(
            <div style={{width:"100%",height:240}}><ResponsiveContainer>
              <BarChart data={trend} margin={{top:8,right:8,left:-24,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#f3f4f6'/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <YAxis domain={ya.domain} ticks={ya.ticks} tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={TS} formatter={(v:number)=>[v,"Visits"]}/>
                <Bar dataKey="visits" name="Visits" fill={NAVY} radius={[6,6,0,0]} barSize={28}/>
              </BarChart>
            </ResponsiveContainer></div>);})()}
          </ChartCard>
          </div>

          <div id="pdf-section-books-timeline">
          <ChartCard title="Books Acquired Timeline" subtitle="Smooth curve per month" icon={<BookOpen size={16}/>} formula="COUNT(BatchBook) per month">
            {(()=>{const ya=dynamicAxis(extractValues(trend,'books'));return(
            <div style={{width:"100%",height:240}}><ResponsiveContainer>
              <AreaChart data={trend} margin={{top:8,right:8,left:-24,bottom:0}}>
                <defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={TEAL} stopOpacity={0.25}/><stop offset="95%" stopColor={TEAL} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#f3f4f6'/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <YAxis domain={ya.domain} ticks={ya.ticks} tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={TS} formatter={(v:number)=>[v,"Books"]}/>
                <Area type="monotone" dataKey="books" name="Books" stroke={TEAL} strokeWidth={3} fill="url(#bg1)" dot={{r:4,strokeWidth:2,fill:'#ffffff',stroke:TEAL}} activeDot={{r:6,fill:TEAL}}/>
              </AreaChart>
            </ResponsiveContainer></div>);})()}
          </ChartCard>
          </div>

          <div id="pdf-section-engagement">
          <ChartCard title="Engagement Breakdown" subtitle="Emails vs Reservations" icon={<Mail size={16}/>} formula="Engagement = (Emails+Res)/Visits x100">
            <div style={{width:"100%",height:240}}><ResponsiveContainer>
              <PieChart>
                <Pie data={mp} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  <Cell fill="#f97316"/><Cell fill={VIOLET}/>
                </Pie>
                <Tooltip contentStyle={TS}/>
              </PieChart>
            </ResponsiveContainer></div>
          </ChartCard>
          </div>

          <div id="pdf-section-ratings-dist">
          <ChartCard title="Ratings Distribution Curve" subtitle="Smooth area 1-5 stars" icon={<Star size={16}/>} formula="Satisfaction = (4*+5*)/Total x100">
            {(()=>{const rd=[1,2,3,4,5].map(s=>({rating:s+"*",count:dist[s]??0}));const ya=dynamicAxis(extractValues(rd,'count'));return(
            <div style={{width:"100%",height:240}}><ResponsiveContainer>
              <AreaChart data={rd} margin={{top:8,right:8,left:-24,bottom:0}}>
                <defs><linearGradient id="rg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD} stopOpacity={0.4}/><stop offset="95%" stopColor={GOLD} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#e5e7eb'/>
                <XAxis dataKey="rating" tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <YAxis domain={ya.domain} ticks={ya.ticks} tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={TS} formatter={(v:number)=>[v,"Responses"]}/>
                <Area type="monotone" dataKey="count" name="Responses" stroke={GOLD} strokeWidth={3} fill="url(#rg1)" dot={{r:5,strokeWidth:2,fill:'#ffffff',stroke:GOLD}} activeDot={{r:7,fill:GOLD}}/>
              </AreaChart>
            </ResponsiveContainer></div>);})()}
          </ChartCard>
          </div>

          <div id="pdf-section-star-pie">
          <ChartCard title="Star Breakdown Pie" subtitle="Per star level" icon={<Star size={16}/>} formula="Weighted Avg = Sum(s*cnt)/Sum(cnt)">
            <div style={{width:"100%",height:240}}><ResponsiveContainer>
              <PieChart>
                <Pie data={rp.filter(d=>d.value>0)} cx="50%" cy="45%" outerRadius={90} paddingAngle={3} dataKey="value">
                  {rp.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
                </Pie>
                <Tooltip contentStyle={TS}/><Legend verticalAlign="bottom" height={30} iconType="circle"/>
              </PieChart>
            </ResponsiveContainer></div>
          </ChartCard>
          </div>

          <div id="pdf-section-scatter">
          <ChartCard title="Visits vs Books (Scatter)" subtitle="Correlation per month" icon={<TrendingUp size={16}/>} formula="Growth = (Curr-Prev)/Prev x100">
            {(()=>{const xa=dynamicAxis(extractValues(trend,'visits'));const ya=dynamicAxis(extractValues(trend,'books'));return(
            <div style={{width:"100%",height:240}}><ResponsiveContainer>
              <ScatterChart margin={{top:8,right:8,left:-24,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke='#e5e7eb'/>
                <XAxis type="number" dataKey="visits" name="Visits" domain={xa.domain} ticks={xa.ticks} tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <YAxis type="number" dataKey="books" name="Books" domain={ya.domain} ticks={ya.ticks} tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={TS} content={({payload})=>{if(!payload?.length)return null;const d=payload[0]?.payload;return(<div className="bg-white rounded-lg shadow p-3 text-xs"><p className="font-semibold mb-1">{d?.name}</p><p className="text-blue-600">Visits: <strong>{d?.visits}</strong></p><p className="text-teal-600">Books: <strong>{d?.books}</strong></p></div>);}}/>
                <Scatter data={trend.map(d=>({...d}))}>{trend.map((_,i)=><Cell key={i} fill={i===trend.length-1?GOLD:NAVY}/>)}</Scatter>
              </ScatterChart>
            </ResponsiveContainer></div>);})()}
            <p className="text-xs text-gray-400 mt-1 text-center">Gold = current month</p>
          </ChartCard>
          </div>

          <div id="pdf-section-combined">
          <ChartCard title="Combined Trend" subtitle="Bar (visits) + Line (books)" icon={<Activity size={16}/>} formula="Growth Rate = (Curr-Prev)/Prev x100">
            {(()=>{const allVals=[...extractValues(trend,'visits'),...extractValues(trend,'books')];const ya=dynamicAxis(allVals);return(
            <div style={{width:"100%",height:240}}><ResponsiveContainer>
              <ComposedChart data={trend} margin={{top:8,right:8,left:-24,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#e5e7eb'/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <YAxis domain={ya.domain} ticks={ya.ticks} tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={TS}/><Legend verticalAlign="bottom" height={30} iconType="circle"/>
                <Bar dataKey="visits" name="Visits" fill={NAVY+"44"} radius={[4,4,0,0]} barSize={24}/>
                <Line type="monotone" dataKey="books" name="Books" stroke={GOLD} strokeWidth={2.5} dot={{r:4,strokeWidth:2,fill:'#ffffff',stroke:GOLD}} activeDot={{r:6,fill:GOLD}}/>
              </ComposedChart>
            </ResponsiveContainer></div>);})()}
          </ChartCard>
          </div>

        </div>
      </div>

      <div className="admin-table-wrapper mt-6 p-6">
        <div className="flex items-center gap-3 mb-6"><Star size={24} className="text-gold"/><h2 className="text-xl font-bold text-gray-800">Ratings Overview</h2></div>
        {data.ratings_summary.total_ratings===0?(<p className="text-gray-500 italic">No ratings received yet.</p>):(
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Distribution</h3>
              <div className="space-y-3">
                {[5,4,3,2,1].map(star=>{const cnt=dist[star]??0;const pct=data.ratings_summary.total_ratings>0?Math.round(cnt/data.ratings_summary.total_ratings*100):0;return(
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16 shrink-0"><span className="text-sm font-medium text-gray-700">{star}</span><Star size={14} className="text-gold fill-gold"/></div>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,backgroundColor:star>=4?'var(--color-gold)':star===3?"var(--color-amber)":"var(--color-danger)",minWidth:cnt>0?"8px":"0px"}}/>
                    </div>
                    <span className="text-sm text-gray-500 w-20 text-right shrink-0">{cnt} ({pct}%)</span>
                  </div>
                );})}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 font-mono">
                <span className="font-semibold text-gray-700">Weighted Avg</span> = Sum(s×cnt)/Sum(cnt) = <strong>{ar}</strong><br/>
                <span className="font-semibold text-gray-700">Satisfaction</span> = (4*+5*)/Total×100 = <strong>{sc}</strong>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="text-7xl font-bold text-gray-800">{ar}</div>
              <div className="flex items-center gap-1">{stars(Math.round(ar))}</div>
              <p className="text-sm text-gray-500">Based on {data.ratings_summary.total_ratings} rating{data.ratings_summary.total_ratings!==1?"s":""}</p>
              <div className="flex gap-6 mt-2">
                <div className="text-center"><p className="text-lg font-bold text-teal-600">{eng}</p><p className="text-xs text-gray-400">Engagement Rate</p></div>
                <div className="text-center"><p className="text-lg font-bold text-blue-600">{gr}</p><p className="text-xs text-gray-400">Books Growth</p></div>
              </div>
            </div>
          </div>
        )}
      </div>

        {(() => {
          if (!data.ratings_summary.recent_feedback) return null;

          // Apply star filter first
          const starFiltered = feedbackStarFilter === 'all'
            ? [...data.ratings_summary.recent_feedback]
            : data.ratings_summary.recent_feedback.filter(f => f.rating === feedbackStarFilter);

          // Apply sort direction
          const processedFeedback = starFiltered.sort((a, b) =>
            feedbackSort === 'desc'
              ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          // Compute fade opacity based on days_old (0 days = 1.0, 30 days = 0.35)
          const getFadeOpacity = (daysOld: number): number => {
            if (daysOld <= 0) return 1.0;
            if (daysOld >= 30) return 0.35;
            return 1.0 - (daysOld / 30) * 0.65;
          };

          const FEEDBACK_PER_PAGE = 10;
          const totalFeedbackPages = Math.ceil(processedFeedback.length / FEEDBACK_PER_PAGE) || 1;
          const currentFeedbackPage = Math.min(feedbackPage, totalFeedbackPages);
          const startIndex = (currentFeedbackPage - 1) * FEEDBACK_PER_PAGE;
          const paginatedFeedback = processedFeedback.slice(startIndex, startIndex + FEEDBACK_PER_PAGE);

          return (
            <div className="admin-table-wrapper mt-6 p-6">
              {/* Header row */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Mail size={24} className="text-navy"/>
                    <h2 className="text-xl font-bold text-gray-800">Recent Feedback</h2>
                    <span className="text-xs font-semibold bg-navy/10 text-navy px-2 py-0.5 rounded-full">
                      {processedFeedback.length} entries
                    </span>
                  </div>
                  {/* Card / Table view toggle */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setFeedbackView('card')} className={`p-2 flex items-center justify-center rounded-lg transition-colors border cursor-pointer ${feedbackView === 'card' ? 'bg-navy text-white border-navy shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`} title="Card View"><span className="material-symbols-outlined text-[18px]">grid_view</span></button>
                    <button onClick={() => setFeedbackView('table')} className={`p-2 flex items-center justify-center rounded-lg transition-colors border cursor-pointer ${feedbackView === 'table' ? 'bg-navy text-white border-navy shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`} title="Table View"><span className="material-symbols-outlined text-[18px]">table_rows</span></button>
                  </div>
                </div>

                {/* Filter bar — dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Sort direction dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Sort:</label>
                    <select
                      value={feedbackSort}
                      onChange={e => { setFeedbackSort(e.target.value as 'desc' | 'asc'); setFeedbackPage(1); }}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none cursor-pointer hover:border-navy focus:border-navy transition-colors"
                    >
                      <option value="desc">Latest to Oldest</option>
                      <option value="asc">Oldest to Latest</option>
                    </select>
                  </div>

                  {/* Star filter dropdown */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Rating:</label>
                    <select
                      value={feedbackStarFilter}
                      onChange={e => { const v = e.target.value; setFeedbackStarFilter(v === 'all' ? 'all' : Number(v) as 1|2|3|4|5); setFeedbackPage(1); }}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none cursor-pointer hover:border-navy focus:border-navy transition-colors"
                    >
                      <option value="all">All Stars</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                </div>
              </div>

              {processedFeedback.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-500 italic">No feedback received yet.</p>
                </div>
              ) : (
                <>
                  {feedbackView === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {paginatedFeedback.map(fb=>{
                        const daysOld = fb.days_old ?? Math.floor((Date.now() - new Date(fb.created_at).getTime()) / 86400000);
                        const opacity = getFadeOpacity(daysOld);
                        const isFading = daysOld >= 20;
                        return (
                        <div key={fb.id} style={{ opacity }} className={`flex flex-col p-4 bg-gray-50 rounded-xl border transition-all shadow-sm ${isFading ? 'border-amber-200' : 'border-gray-100 hover:bg-gray-100/60'}`}>
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="font-semibold text-gray-800 truncate">{fb.name}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isFading && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">{daysOld}d — fading</span>}
                              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">{fb.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-3">{stars(fb.rating)}</div>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 leading-relaxed">{fb.message}</p>
                          <p className="text-xs font-medium text-gray-400 mt-auto">{new Date(fb.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )})}
                    </div>
                  ) : (
                    <div className="overflow-x-auto mb-4 border border-gray-200 rounded-xl shadow-sm">
                      <table className="admin-table w-full text-left bg-white">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                          <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2">Message</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Date / Age</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedFeedback.map(fb => {
                            const daysOld = fb.days_old ?? Math.floor((Date.now() - new Date(fb.created_at).getTime()) / 86400000);
                            const opacity = getFadeOpacity(daysOld);
                            const isFading = daysOld >= 20;
                            return (
                            <tr key={fb.id} style={{ opacity }} className={`transition-all ${isFading ? 'bg-amber-50/40' : 'hover:bg-gray-50/80'}`}>
                              <td className="p-4 text-sm font-medium text-gray-800 whitespace-nowrap">{fb.name}</td>
                              <td className="p-4 text-sm whitespace-nowrap"><span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">{fb.category}</span></td>
                              <td className="p-4 whitespace-nowrap"><div className="flex gap-0.5">{stars(fb.rating)}</div></td>
                              <td className="p-4 text-sm text-gray-600 leading-relaxed">{fb.message}</td>
                              <td className="p-4 text-xs font-medium text-gray-400 whitespace-nowrap text-right">
                                <div>{new Date(fb.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                {isFading && <div className="text-amber-500 font-bold mt-0.5">{daysOld}d old — fading</div>}
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 gap-4 mt-2">
                    <span className="text-sm font-medium text-gray-500">
                      Showing {processedFeedback.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + FEEDBACK_PER_PAGE, processedFeedback.length)} of {processedFeedback.length} entries
                    </span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setFeedbackPage(p => Math.max(1, p - 1))}
                        disabled={currentFeedbackPage <= 1}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 disabled:opacity-40 disabled:bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
                      >
                        Prev
                      </button>
                      {Array.from({length: totalFeedbackPages}, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setFeedbackPage(page)}
                          className={`min-w-[32px] h-[32px] flex items-center justify-center text-sm font-bold rounded-lg border cursor-pointer transition-colors ${currentFeedbackPage === page ? 'bg-navy text-white border-navy shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button 
                        onClick={() => setFeedbackPage(p => Math.min(totalFeedbackPages, p + 1))}
                        disabled={currentFeedbackPage >= totalFeedbackPages}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 disabled:opacity-40 disabled:bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}
      </>
  );
}



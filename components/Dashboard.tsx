import React, { useMemo, useState } from 'react';
import { AppState, Activity, Objective } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Calendar, CheckCircle2, Clock, AlertCircle, FileText, Loader2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [isExporting, setIsExporting] = useState(false);

  // 1. Prepare Data for Activity Summary & Chart
  const availableMonths = Object.keys(state.hours).sort();
  const displayMonths = availableMonths.filter(m => ['2025-10', '2025-11', '2025-12'].includes(m));
  const monthsToShow = displayMonths.length > 0 ? displayMonths : availableMonths.slice(-3);

  const formatMonth = (m: string) => {
    const d = new Date(m + '-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Calculate percentages per month
  const activityData = useMemo(() => {
    const data: any[] = [];
    const totals: Record<string, number> = {};

    monthsToShow.forEach(month => {
      let monthTotal = 0;
      const monthHours = state.hours[month] || {};
      state.activities.forEach(act => {
        const h = (Object.values(monthHours[act.id] || {}) as number[]).reduce((sum, val) => sum + val, 0);
        monthTotal += h;
      });
      totals[month] = monthTotal;
    });

    state.activities.filter(a => a.isActive).forEach(act => {
      const row: any = { id: act.id, name: act.name, color: act.color };
      monthsToShow.forEach(month => {
        const monthHours = state.hours[month] || {};
        const h = (Object.values(monthHours[act.id] || {}) as number[]).reduce((sum, val) => sum + val, 0);
        row[month] = totals[month] > 0 ? (h / totals[month]) : 0;
      });
      data.push(row);
    });
    return data;
  }, [state.hours, state.activities, monthsToShow]);

  // Calculate detailed hours per month
  const hoursData = useMemo(() => {
    const data: any[] = [];
    state.activities.filter(a => a.isActive).forEach(act => {
      const row: any = { id: act.id, name: act.name, color: act.color, total: 0 };
      monthsToShow.forEach(month => {
        const monthHours = state.hours[month] || {};
        const h = (Object.values(monthHours[act.id] || {}) as number[]).reduce((sum, val) => sum + val, 0);
        row[month] = h;
        row.total += h;
      });
      data.push(row);
    });
    return data.sort((a, b) => b.total - a.total);
  }, [state.hours, state.activities, monthsToShow]);

  // Transform data for Stacked Bar Chart
  const chartData = useMemo(() => {
    return monthsToShow.map(month => {
      const row: any = { name: formatMonth(month) };
      activityData.forEach(act => {
        row[act.name] = (act[month] * 100); 
      });
      return row;
    });
  }, [activityData, monthsToShow]);


  // Helper for status color
  const getStatusColor = (pct: number, status: string) => {
    if (status === 'Completed' || pct >= 0.9) return 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    if (pct < 0.2 || status === 'Blocked') return 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    return 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    // We target specific blocks via class 'report-block'
    const header = document.getElementById('dashboard-header');
    const blocks = document.querySelectorAll('.report-block');
    
    if (blocks.length > 0) {
      try {
        // Wait for any animations/renders
        await new Promise(resolve => setTimeout(resolve, 800));

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - (2 * margin);
        
        let currentY = margin;

        const addToPdf = async (element: HTMLElement) => {
           // We clone the node to ensure we can modify styles for capture if needed (e.g. removing shadows)
           // But html2canvas on the live element is usually fine if we handle height.
           
           const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: state.settings.theme === 'dark' ? '#0f172a' : '#f9fafb', // Match page bg to handle rounded corners
           });

           const imgData = canvas.toDataURL('image/png');
           const imgProps = pdf.getImageProperties(imgData);
           const imgHeight = (imgProps.height * contentWidth) / imgProps.width;

           // Check if we need a new page
           // We allow a small error margin
           if (currentY + imgHeight > pageHeight - margin) {
             pdf.addPage();
             currentY = margin;
           }

           pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeight);
           currentY += imgHeight + 8; // 8mm gap between blocks
        };

        // 1. Header
        if (header) {
           await addToPdf(header as HTMLElement);
        } else {
           // Fallback if header not found
           pdf.setFontSize(16);
           pdf.text("Dashboard Report", margin, currentY + 5);
           currentY += 15;
        }

        // 2. Blocks
        for (let i = 0; i < blocks.length; i++) {
            await addToPdf(blocks[i] as HTMLElement);
        }

        pdf.save(`${state.meta.userName}_Report_${state.meta.year}.pdf`);

      } catch (err) {
        console.error("PDF Export failed", err);
        alert("Failed to generate PDF. Please try again.");
      }
    }
    setIsExporting(false);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Actions */}
      <div id="dashboard-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-dark p-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Performance metrics, objectives, and detailed logs for {state.meta.year}
          </p>
        </div>
        
        {/* Hide button during export capture if strictly grabbing header, but here we likely capture it. 
            We can hide the button using data-html2canvas-ignore attribute */}
        <button 
          data-html2canvas-ignore="true"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin mr-2" /> : <Download size={18} className="mr-2" />}
          {isExporting ? 'Generating...' : 'Download Full Report'}
        </button>
      </div>

      {/* Report Container */}
      <div id="dashboard-report-content" className="space-y-8 animate-fade-in p-4 rounded-xl bg-gray-50 dark:bg-dark">

        {/* SECTION 1: ACTIVITIES SUMMARY & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 break-inside-avoid">
          
          {/* Activity Table */}
          <div className="report-block bg-white dark:bg-darkSurface rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-3 border-b border-blue-200 dark:border-blue-800 flex justify-between items-center">
              <h2 className="font-bold text-lg text-blue-900 dark:text-blue-100">Activity Distribution</h2>
              <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Percentage (%)</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3">Activity</th>
                    {monthsToShow.map(m => (
                      <th key={m} className="px-4 py-3 text-right">{formatMonth(m)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {activityData.map(act => (
                    <tr key={act.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200 border-l-4" style={{borderLeftColor: act.color}}>
                        {act.name}
                      </td>
                      {monthsToShow.map(m => {
                        const val = act[m];
                        const opacity = Math.min(0.5, val * 0.8);
                        return (
                          <td key={m} className="px-4 py-2 text-right relative">
                            <div 
                               className="absolute inset-0 bg-green-500 dark:bg-green-400 pointer-events-none" 
                               style={{ opacity: val > 0 ? opacity : 0 }} 
                            />
                            <span className="relative z-10 font-medium dark:text-gray-100">
                              {val > 0 ? (val * 100).toFixed(0) + '%' : '-'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">Total</td>
                    {monthsToShow.map(m => (
                      <td key={m} className="px-4 py-3 text-right">100%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Stacked Chart */}
          <div className="report-block bg-white dark:bg-darkSurface rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex flex-col">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">Visual Distribution</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  {state.activities.filter(a => a.isActive).map((act, idx) => (
                    <Bar 
                      key={act.id} 
                      dataKey={act.name} 
                      stackId="a" 
                      fill={act.color} 
                      radius={idx === state.activities.length - 1 ? [4, 4, 0, 0] : [0,0,0,0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SECTION 2: DETAILED HOURS BREAKDOWN */}
        <div className="report-block bg-white dark:bg-darkSurface rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden break-inside-avoid">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 px-4 py-3 border-b border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
            <h2 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">Detailed Hours Breakdown</h2>
            <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Time Spent (Hours)</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">Activity</th>
                  {monthsToShow.map(m => (
                    <th key={m} className="px-4 py-3 text-right">{formatMonth(m)}</th>
                  ))}
                  <th className="px-4 py-3 text-right text-indigo-600 dark:text-indigo-400">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {hoursData.map(act => (
                  <tr key={act.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200 border-l-4" style={{borderLeftColor: act.color}}>
                      {act.name}
                    </td>
                    {monthsToShow.map(m => (
                      <td key={m} className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                        {act[m] > 0 ? act[m].toFixed(1) : '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-bold text-indigo-600 dark:text-indigo-400">
                      {act.total.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: OBJECTIVES TABLE */}
        <div className="report-block bg-white dark:bg-darkSurface rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden break-inside-avoid">
          <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-3 border-b border-orange-200 dark:border-orange-800">
            <h2 className="font-bold text-lg text-orange-900 dark:text-orange-100">Objectives for {state.meta.year}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-orange-50 dark:bg-orange-900/10 text-gray-700 dark:text-gray-300 border-b border-orange-200 dark:border-orange-800">
                <tr>
                  <th className="px-4 py-3 w-1/3 min-w-[300px]">Description</th>
                  <th className="px-4 py-3 w-24 text-center">Total Status</th>
                  {monthsToShow.map(m => (
                     <React.Fragment key={m}>
                        <th className="px-2 py-3 w-16 text-center border-l border-orange-100 dark:border-orange-800/30 text-xs uppercase">{formatMonth(m)} %</th>
                        <th className="px-4 py-3 min-w-[180px] text-xs uppercase">Notes for {formatMonth(m)}</th>
                     </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {state.objectives.map(obj => {
                   const totalProg = (Object.values(obj.monthlyData) as { progress: number }[]).reduce((sum, d) => sum + d.progress, 0);
                   const totalPct = Math.min(100, (totalProg / obj.target) * 100);
                   
                   return (
                    <tr key={obj.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200 align-top">
                        <div className="font-medium mb-1">{obj.description}</div>
                        {obj.deadline && (
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock size={12} className="mr-1" /> Due: {obj.deadline}
                          </div>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center align-top font-bold ${getStatusColor(totalPct/100, obj.status)}`}>
                        {totalPct.toFixed(0)}%
                      </td>
                      {monthsToShow.map(m => {
                        const mData = obj.monthlyData[m];
                        const val = mData?.progress || 0;
                        const note = mData?.note || '';
                        
                        return (
                          <React.Fragment key={m}>
                             <td className="px-2 py-3 text-center align-top border-l border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                               {val > 0 ? (val * 100).toFixed(1) + '%' : ''}
                             </td>
                             <td className="px-4 py-3 align-top text-xs text-gray-500 dark:text-gray-400 italic">
                               {note}
                             </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: NEWS OF THE MONTH */}
        <div className="report-block bg-white dark:bg-darkSurface rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden break-inside-avoid">
           <div className="bg-green-100 dark:bg-green-900/30 px-4 py-3 border-b border-green-200 dark:border-green-800">
              <h2 className="font-bold text-lg text-green-900 dark:text-green-100">News & Logs</h2>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-2 w-32">Date</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2 w-32">Tags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                   {[...state.news].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                     <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                       <td className="px-4 py-2 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                         {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                       </td>
                       <td className="px-4 py-2 text-gray-800 dark:text-gray-200 font-medium">
                         {item.text}
                       </td>
                       <td className="px-4 py-2">
                         <div className="flex gap-1">
                           {item.tags.map(tag => (
                             <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                               {tag}
                             </span>
                           ))}
                         </div>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
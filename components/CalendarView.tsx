import React, { useMemo, useRef } from 'react';
import { AppState, Activity, HoursData } from '../types';
import { getDaysInMonth, generateId } from '../services/dataService';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Undo, Redo, FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CalendarViewProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ state, updateState }) => {
  const selectedMonth = state.settings.currentMonth;
  const [isAdding, setIsAdding] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [newActivityName, setNewActivityName] = React.useState('');
  const [newActivityColor, setNewActivityColor] = React.useState('#3b82f6');

  // Undo/Redo Stacks
  const historyPast = useRef<HoursData[]>([]);
  const historyFuture = useRef<HoursData[]>([]);
  const snapshotRef = useRef<HoursData | null>(null);

  const [year, month] = selectedMonth.split('-').map(Number);

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const TARGET_HOURS = 8;
  
  // Helper to format date header
  const getDayLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return {
      day: d,
      name: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    };
  };

  const handleFocus = () => {
    snapshotRef.current = JSON.parse(JSON.stringify(state.hours));
  };

  const handleBlur = (activityId: string, day: string) => {
    if (!snapshotRef.current) return;
    const originalVal = snapshotRef.current[selectedMonth]?.[activityId]?.[day] || 0;
    const currentVal = state.hours[selectedMonth]?.[activityId]?.[day] || 0;
    
    if (originalVal !== currentVal) {
      historyPast.current.push(snapshotRef.current);
      historyFuture.current = []; // Clear redo stack
    }
    snapshotRef.current = null;
  };

  const handleUndo = () => {
    if (historyPast.current.length === 0) return;
    const prev = historyPast.current.pop();
    if (prev) {
      historyFuture.current.push(JSON.parse(JSON.stringify(state.hours)));
      updateState({ hours: prev });
    }
  };

  const handleRedo = () => {
    if (historyFuture.current.length === 0) return;
    const next = historyFuture.current.pop();
    if (next) {
      historyPast.current.push(JSON.parse(JSON.stringify(state.hours)));
      updateState({ hours: next });
    }
  };

  const handleHourChange = (activityId: string, date: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) && value !== '') return;
    
    const newHours = JSON.parse(JSON.stringify(state.hours));
    if (!newHours[selectedMonth]) newHours[selectedMonth] = {};
    if (!newHours[selectedMonth][activityId]) newHours[selectedMonth][activityId] = {};
    
    newHours[selectedMonth][activityId][date] = value === '' ? 0 : numValue;
    updateState({ hours: newHours });
  };

  const handleMonthChange = (increment: number) => {
    const d = new Date(year, month - 1 + increment, 1);
    const newY = d.getFullYear();
    const newM = String(d.getMonth() + 1).padStart(2, '0');
    updateState({ settings: { ...state.settings, currentMonth: `${newY}-${newM}` } });
  };

  const confirmAddActivity = () => {
    if (!newActivityName.trim()) return;
    const newActivity: Activity = {
      id: `act_${generateId()}`,
      name: newActivityName.trim(),
      color: newActivityColor,
      isActive: true
    };
    updateState({ activities: [...state.activities, newActivity] });
    setIsAdding(false);
    setNewActivityName('');
    setNewActivityColor('#3b82f6');
  };

  const toggleActivityStatus = (id: string) => {
    const updated = state.activities.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    updateState({ activities: updated });
  }

  const handleActivityColorChange = (id: string, color: string) => {
    const updated = state.activities.map(a => 
      a.id === id ? { ...a, color } : a
    );
    updateState({ activities: updated });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('calendar-export-content');
    
    if (element) {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: state.settings.theme === 'dark' ? '#1e293b' : '#ffffff',
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const pdfPtWidth = 841.89; 
        const pdfPtHeight = (imgHeight * pdfPtWidth) / imgWidth;
        
        const pdf = new jsPDF('l', 'pt', [pdfPtWidth, pdfPtHeight]);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfPtWidth, pdfPtHeight);
        pdf.save(`${state.meta.userName}_Calendar_${selectedMonth}.pdf`);
      } catch (e) {
        console.error(e);
        alert('Export failed. Please try again.');
      }
    }
    setIsExporting(false);
  };

  // Calculate totals
  const totals = useMemo(() => {
    const monthData = state.hours[selectedMonth] || {};
    const activityTotals: Record<string, number> = {};
    const dailyTotals: Record<string, number> = {};
    let grandTotal = 0;

    state.activities.forEach(act => {
      let actSum = 0;
      days.forEach(day => {
        const h = monthData[act.id]?.[day] || 0;
        actSum += h;
        dailyTotals[day] = (dailyTotals[day] || 0) + h;
      });
      activityTotals[act.id] = actSum;
      grandTotal += actSum;
    });

    return { activityTotals, dailyTotals, grandTotal };
  }, [state.hours, state.activities, selectedMonth, days]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-darkSurface p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold w-48 text-center">
            {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex space-x-2 items-center">
           <button 
             onClick={handleUndo} 
             disabled={historyPast.current.length === 0}
             className={`p-2 rounded-lg transition-colors ${historyPast.current.length > 0 ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
             title="Undo"
           >
             <Undo size={20} />
           </button>
           <button 
             onClick={handleRedo} 
             disabled={historyFuture.current.length === 0}
             className={`p-2 rounded-lg transition-colors ${historyFuture.current.length > 0 ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
             title="Redo"
           >
             <Redo size={20} />
           </button>
           <div className="w-px bg-gray-300 dark:bg-gray-700 mx-2 h-8 self-center"></div>
           <button 
             onClick={handleExportPDF}
             disabled={isExporting}
             className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors mr-2 disabled:opacity-50"
           >
             {isExporting ? <Loader2 size={16} className="animate-spin mr-2" /> : <FileText size={16} className="mr-2" />}
             Export
           </button>
           <button 
             onClick={() => setIsAdding(true)} 
             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
           >
             <Plus size={16} className="mr-2" /> Activity
           </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto bg-white dark:bg-darkSurface rounded-xl shadow-sm relative border border-gray-200 dark:border-gray-700 scrollbar-hide">
        <div className="min-w-max" id="calendar-export-content">
          {/* Header Row */}
          <div className="flex sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="sticky left-0 w-48 p-3 font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 z-20 border-r border-gray-200 dark:border-gray-700">
              Activity
            </div>
            {days.map(d => {
              const { day, name, isWeekend } = getDayLabel(d);
              return (
                <div 
                  key={d} 
                  className={`w-12 flex-shrink-0 p-2 text-center border-r border-gray-100 dark:border-gray-700 ${isWeekend ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}
                >
                  <div className="text-[10px] text-gray-400 uppercase leading-tight">{name}</div>
                  <div className={`font-semibold text-sm ${isWeekend ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>{day}</div>
                </div>
              );
            })}
            <div className="w-20 p-3 font-semibold text-center sticky right-20 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-10 text-gray-700 dark:text-gray-300">
              Sum
            </div>
            <div className="w-20 p-3 font-semibold text-center sticky right-0 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-10 text-gray-700 dark:text-gray-300">
              %
            </div>
          </div>

          {/* Activity Rows */}
          {state.activities.filter(a => a.isActive).map(activity => {
            const rowTotal = totals.activityTotals[activity.id] || 0;
            const percentage = totals.grandTotal > 0 ? (rowTotal / totals.grandTotal) * 100 : 0;
            
            return (
            <div key={activity.id} className="flex border-b border-gray-100 dark:border-gray-800 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div 
                className="sticky left-0 w-48 p-3 flex items-center justify-between bg-white dark:bg-darkSurface group-hover:bg-gray-50 dark:group-hover:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                style={{ borderLeft: `4px solid ${activity.color}` }}
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="relative w-3 h-3 overflow-hidden rounded-full flex-shrink-0 cursor-pointer hover:scale-110 transition-transform">
                    <input 
                      type="color" 
                      value={activity.color} 
                      onChange={(e) => handleActivityColorChange(activity.id, e.target.value)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                    />
                  </div>
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200" title={activity.name}>{activity.name}</span>
                </div>
                <button 
                  onClick={() => toggleActivityStatus(activity.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                  title="Archive Activity"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {days.map(d => {
                const { isWeekend } = getDayLabel(d);
                const val = state.hours[selectedMonth]?.[activity.id]?.[d] || 0;
                return (
                  <div 
                    key={`${activity.id}-${d}`} 
                    className={`w-12 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 relative ${isWeekend ? 'bg-orange-50/30 dark:bg-orange-900/5' : ''}`}
                  >
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      className="w-full h-full p-1 text-center bg-transparent focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500 text-sm text-gray-600 dark:text-gray-300 placeholder-transparent"
                      value={val === 0 ? '' : val}
                      onFocus={handleFocus}
                      onBlur={() => handleBlur(activity.id, d)}
                      onChange={(e) => handleHourChange(activity.id, d, e.target.value)}
                    />
                  </div>
                );
              })}

              <div className="w-20 flex items-center justify-center font-bold text-sm text-gray-800 dark:text-gray-200 sticky right-20 bg-gray-50 dark:bg-gray-800/80 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 border-l border-gray-200 dark:border-gray-700 z-10">
                {rowTotal > 0 ? rowTotal : '-'}
              </div>
              <div className="w-20 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 sticky right-0 bg-gray-50 dark:bg-gray-800/80 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 border-l border-gray-200 dark:border-gray-700 z-10">
                {percentage > 0 ? `${percentage.toFixed(2)}%` : '-'}
              </div>
            </div>
            );
          })}

          {/* Daily Totals Footer */}
          <div className="flex sticky bottom-0 z-20 bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-600 font-bold shadow-lg">
            <div className="sticky left-0 w-48 p-3 text-right pr-4 bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm">
              Daily Total
            </div>
            {days.map(d => {
               const dayTotal = totals.dailyTotals[d] || 0;
               let bgClass = '';
               let textClass = 'text-gray-400';
               
               if (dayTotal > 0) {
                 if (dayTotal === TARGET_HOURS) {
                   bgClass = 'bg-green-100 dark:bg-green-900/30';
                   textClass = 'text-green-700 dark:text-green-400';
                 } else if (dayTotal > TARGET_HOURS) {
                   bgClass = 'bg-red-100 dark:bg-red-900/30';
                   textClass = 'text-red-700 dark:text-red-400';
                 } else {
                   bgClass = 'bg-amber-50 dark:bg-amber-900/20';
                   textClass = 'text-amber-600 dark:text-amber-500';
                 }
               }

               return (
                <div key={`total-${d}`} className={`w-12 flex-shrink-0 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 text-sm ${bgClass} ${textClass}`}>
                  {dayTotal > 0 ? dayTotal : '-'}
                </div>
               )
            })}
             <div className="w-20 p-3 text-center text-blue-700 dark:text-blue-400 sticky right-20 bg-gray-100 dark:bg-gray-900 border-l border-gray-300 dark:border-gray-600">
               {totals.grandTotal}
             </div>
             <div className="w-20 p-3 text-center text-gray-500 dark:text-gray-500 sticky right-0 bg-gray-100 dark:bg-gray-900 border-l border-gray-300 dark:border-gray-600 text-xs">
               100%
             </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-darkSurface p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Activity</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input 
                type="text" 
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newActivityName}
                onChange={e => setNewActivityName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && confirmAddActivity()}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={newActivityColor}
                  onChange={(e) => setNewActivityColor(e.target.value)}
                  className="h-10 w-20 p-0 border-0 rounded cursor-pointer" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAddActivity}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
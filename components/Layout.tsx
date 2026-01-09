import React, { useState } from 'react';
import { ViewType, AppState } from '../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Target, 
  Newspaper, 
  Settings, 
  Menu, 
  Moon, 
  Sun,
  Download,
  Upload,
  Plus,
  FileJson,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  state: AppState;
  onToggleTheme: () => void;
  onExport: () => void;
  onExportJSON: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  setView, 
  state, 
  onToggleTheme, 
  onExport, 
  onExportJSON,
  onImport,
  onReset,
  children 
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: ViewType.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewType.CALENDAR, label: 'Calendar', icon: Calendar },
    { id: ViewType.OBJECTIVES, label: 'Objectives', icon: Target },
    { id: ViewType.NEWS, label: 'News & Log', icon: Newspaper },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${state.settings.theme}`}>
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-darkSurface border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {state.meta.userName}
          </span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <Menu size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon size={18} className="mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-darkSurface">
          <div className="flex items-center justify-between mb-4 px-2">
             <span className="text-xs text-gray-400 dark:text-gray-500">
                {state.meta.year} Edition
             </span>
             <button onClick={onToggleTheme} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
               {state.settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
             </button>
          </div>
          
          <div className="space-y-2">
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={onExport}
                  title="Download CSV"
                  className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition"
                >
                  <FileSpreadsheet size={14} className="mr-1" /> CSV
                </button>
                <button 
                  onClick={onExportJSON}
                  title="Download JSON Backup"
                  className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-yellow-600 rounded hover:bg-yellow-700 transition"
                >
                  <FileJson size={14} className="mr-1" /> JSON
                </button>
             </div>
             <label className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition w-full">
                <Upload size={14} className="mr-1" /> Load CSV/TXT/Excel
                <input type="file" accept=".csv,.txt,.json,.xlsx,.xls" onChange={onImport} className="hidden" />
             </label>
             <button 
               onClick={onReset}
               className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition mt-2"
             >
               <RotateCcw size={14} className="mr-1" /> Reset Data
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-dark">
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-darkSurface border-b border-gray-200 dark:border-gray-800 shadow-sm z-10">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-4">
             {/* Header Global Actions can go here */}
             <div className="text-sm text-gray-500 hidden md:block">
               Autosave Enabled • Last synced: {new Date(state.meta.lastUpdated).toLocaleDateString()}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
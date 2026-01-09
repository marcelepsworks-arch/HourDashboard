// HOLA, AIXÒ ÉS UNA PROVA DE SINCRONITZACIÓ

import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import ObjectivesView from './components/ObjectivesView';
import NewsView from './components/NewsView';
import { AppState, ViewType } from './types';
import { getInitialAppState, exportToCSV, parseCSV, parseExcel, parseCustomLegacyFormat } from './services/dataService';

const STORAGE_KEY = 'marcel_dashboard_data_v1';

const App: React.FC = () => {
  // Main Application State with LocalStorage Initialization
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
    return getInitialAppState();
  });

  const [currentView, setView] = useState<ViewType>(ViewType.DASHBOARD);

  // Autosave: Persist to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save to local storage", e);
    }
  }, [state]);

  // Initialize Theme
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  const updateState = useCallback((newState: Partial<AppState>) => {
    setState(prev => ({
      ...prev,
      ...newState,
      meta: { ...prev.meta, lastUpdated: new Date().toISOString() }
    }));
  }, []);

  const toggleTheme = () => {
    const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    updateState({ settings: { ...state.settings, theme: newTheme } });
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data to default? This action cannot be undone and you will lose all current progress.')) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        // CRITICAL: Always generate a fresh copy of the initial state
        setState(getInitialAppState());
        alert('Data reset successfully.');
      } catch (e) {
        console.error("Failed to reset data", e);
      }
    }
  };

  // CSV Persistence Logic
  const handleExport = () => {
    const csvContent = exportToCSV(state);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `marcel_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Persistence Logic
  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `marcel_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
         const parsed = await parseExcel(file);
         // Only update if we actually got something back
         if (Object.keys(parsed).length > 0) {
            updateState(parsed);
            alert('Excel Data imported successfully!');
         } else {
            alert('No valid data found in the Excel file. Please check sheet names (Activities, Objectives, News, Hours).');
         }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
              const trimmed = text.trim();
              
              // Attempt JSON parsing if file extension is json OR content starts with {
              if (file.name.endsWith('.json') || trimmed.startsWith('{')) {
                 try {
                   const rawData = JSON.parse(text);
                   
                   // Robust Detection for Legacy Format
                   const keys = Object.keys(rawData).map(k => k.toLowerCase());
                   const isLegacy = keys.some(k => k.includes('monthly report') || k.includes('hours '));

                   if (isLegacy) {
                      const parsed = parseCustomLegacyFormat(rawData);
                      // Custom import replaces state completely for consistency
                      setState(prev => ({ ...prev, ...parsed }));
                      alert('Custom Report JSON imported successfully!');
                   } else {
                      // Standard backup import
                      updateState(rawData);
                      alert('JSON Backup imported successfully!');
                   }
                 } catch (e) {
                   console.warn("JSON parse failed, attempting CSV fall back if not explicitly .json file");
                   // If it was explicitly .json, fail here
                   if (file.name.endsWith('.json')) {
                     alert('Invalid JSON file.');
                     return;
                   }
                   // Fallback for .txt files that might look like JSON but aren't, or failed
                   const parsed = parseCSV(text);
                   if (Object.keys(parsed).length > 0) {
                      updateState(parsed);
                      alert('Data imported successfully from CSV/TXT!');
                   } else {
                      alert('No valid data found.');
                   }
                 }
              } else {
                 // Assumes CSV format for other text files
                 const parsed = parseCSV(text);
                 if (Object.keys(parsed).length > 0) {
                    updateState(parsed);
                    alert('Data imported successfully from CSV/TXT!');
                 } else {
                    alert('No valid data found in the file. Ensure it follows the [SECTION] format.');
                 }
              }
          }
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to import file. Ensure the format matches the app structure.');
    }
    // Reset file input
    e.target.value = '';
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard state={state} />;
      case ViewType.CALENDAR:
        return <CalendarView state={state} updateState={updateState} />;
      case ViewType.OBJECTIVES:
        return <ObjectivesView state={state} updateState={updateState} />;
      case ViewType.NEWS:
        return <NewsView state={state} updateState={updateState} />;
      default:
        return <Dashboard state={state} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setView} 
      state={state}
      onToggleTheme={toggleTheme}
      onExport={handleExport}
      onExportJSON={handleExportJSON}
      onImport={handleImport}
      onReset={handleResetData}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
import { AppState, Activity, Objective, NewsItem, HoursData } from '../types';
import * as XLSX from 'xlsx';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const getDaysInMonth = (year: number, month: number): string[] => {
  const date = new Date(year, month - 1, 1);
  const days: string[] = [];
  while (date.getMonth() === month - 1) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getMonthKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// Return a fresh copy of Initial Seed Data
export const getInitialAppState = (): AppState => ({
  meta: {
    year: 2025,
    userName: 'Marcel',
    lastUpdated: new Date().toISOString(),
  },
  settings: {
    theme: 'light',
    hourLimitPerDay: 24,
    currentMonth: '2025-12',
  },
  activities: [
    { id: 'act_1', name: 'Newsletter', description: 'Mailchimp & Content', color: '#3b82f6', isActive: true },
    { id: 'act_2', name: 'Analyzing website', description: 'SEO & Structure', color: '#f97316', isActive: true },
    { id: 'act_3', name: 'Analyze server performance', description: 'WPO & Cache', color: '#a8a29e', isActive: true },
    { id: 'act_4', name: 'Product image', description: 'GPS/GNSS Antenna', color: '#f59e0b', isActive: true },
    { id: 'act_5', name: 'WEB Translation Automation', description: 'Infrastructure', color: '#06b6d4', isActive: true },
    { id: 'act_6', name: 'Page RTK in 5 minute', description: 'Content Creation', color: '#84cc16', isActive: true },
    { id: 'act_7', name: 'Arduimple page improve', description: 'Design updates', color: '#3b82f6', isActive: true },
    { id: 'act_8', name: 'Majestic and SEO report', description: 'Backlinks', color: '#eab308', isActive: true },
    { id: 'act_9', name: 'Backlinks report and Majestic', description: 'Analysis', color: '#78716c', isActive: true },
  ],
  objectives: [
    {
      id: 'obj_1',
      description: 'Monthly newsletters: Create newsletters in Mailchimp, along with website banners for each newsletter topic. Ensure each banner is optimized for desktop, mobile, and tablet.',
      target: 1,
      status: 'Completed', // 100%
      monthlyData: {
        '2025-10': { progress: 0.05, note: 'working on Newsletter November - New banner and content' },
        '2025-11': { progress: 0.667, note: 'Launch 2 newsletters, Septrina GS, and Black Friday' },
        '2025-12': { progress: 0.28, note: 'Prepare image for dual band antenna newsletter. Launch of Handheld 2 newsletter.' }
      }
    },
    {
      id: 'obj_2',
      description: 'Improve or prepare 30 product images for product pages',
      target: 1, // Interpreting 43% as progress towards 1.0
      status: 'In Progress', // 43%
      monthlyData: {
        '2025-10': { progress: 0.10, note: 'updated 3 pictures of GPS/GNSS Antenna Signal Splitter with better q-ty' },
        '2025-11': { progress: 0.333, note: 'Updated 3 Pictures of mosaic GS and 4 Splitter antenna images' },
        '2025-12': { progress: 0, note: '' }
      }
    },
    {
      id: 'obj_3',
      description: 'Redesign and implement new design the Compatible Software page with links to tutorials: https://www.ardusimple.com/compatible-software',
      target: 1,
      status: 'Completed', // 100%
      monthlyData: {
        '2025-10': { progress: 0, note: '' },
        '2025-11': { progress: 0.10, note: 'Start to make the layout of Compatible Software' },
        '2025-12': { progress: 0.90, note: 'Improved Compatible software, buttons, and list of compatible soft with csv' }
      }
    },
    {
      id: 'obj_4',
      description: 'Update the menu behavior (PRODUCTS / NEWS / SUPPORT / STORE) so it expands only on click, not on hover',
      target: 1,
      status: 'Blocked', // 5%
      monthlyData: {
        '2025-10': { progress: 0, note: '' },
        '2025-11': { progress: 0, note: '' },
        '2025-12': { progress: 0.05, note: 'Gave a try but no success' }
      }
    },
    {
      id: 'obj_5',
      description: 'Analyze how we can improve Web Performance and prepare a list of improvements',
      target: 1,
      status: 'In Progress', // 25%
      monthlyData: {
        '2025-10': { progress: 0.15, note: 'Tested Cache plugin, Analyzed plugins on staging site which we can disable. Prepare a document with list of improvements for Josep.' },
        '2025-11': { progress: 0.10, note: 'Semrush Audit - SEO Report November' },
        '2025-12': { progress: 0, note: '' }
      }
    }
  ],
  news: [
    { id: 'n1', date: '2025-10-01', text: 'Check and fix website performance WPO', tags: ['dev'] },
    { id: 'n2', date: '2025-10-15', text: 'Website SEO and structure Audit', tags: ['seo'] },
    { id: 'n3', date: '2025-10-20', text: 'Found a solution to make subheaders visible under the sticky H1 header', tags: ['dev'] },
    { id: 'n4', date: '2025-11-25', text: 'Fix mobile view for Arduimple.com', tags: ['dev'] },
    { id: 'n5', date: '2025-11-25', text: 'Help Oksana with DigiKey Images / Husqvarna Labels - image fix', tags: ['design'] },
    { id: 'n6', date: '2025-11-25', text: 'Checkout coupons custom messages', tags: ['dev'] },
    { id: 'n7', date: '2025-11-25', text: 'septentria on home page images creation', tags: ['design'] },
    { id: 'n8', date: '2025-12-25', text: 'Help Carol with Husqvarna sticker', tags: ['design'] },
    { id: 'n9', date: '2025-12-25', text: 'Tried to fix TOC menu issue on several pages', tags: ['dev'] },
    { id: 'n10', date: '2025-12-25', text: 'Majestic extract bad backlinks and filter the list', tags: ['seo'] },
  ],
  // Mocking hours to roughly match percentages in image
  hours: {
    '2025-10': {
      'act_1': { '2025-10-01': 22 }, // Newsletter ~22%
      'act_2': { '2025-10-02': 36 }, // Analyzing website ~36%
      'act_3': { '2025-10-03': 26 }, // Analyze server ~26%
      'act_4': { '2025-10-04': 6 },  // Product image ~6%
      'act_5': { '2025-10-05': 10 }, // Translation ~10%
    },
    '2025-11': {
      'act_1': { '2025-11-01': 30 }, // Newsletter ~30%
      'act_2': { '2025-11-02': 8 },  // Analyzing website ~8%
      'act_4': { '2025-11-03': 4 },  // Product image ~4%
      'act_5': { '2025-11-04': 2 },  // Translation ~2%
      'act_6': { '2025-11-05': 10 }, // Page RTK ~10%
      'act_7': { '2025-11-06': 41 }, // Arduimple page ~41%
      'act_8': { '2025-11-07': 3 },  // Majestic ~3%
      'act_9': { '2025-11-08': 2 },  // Backlinks ~2%
    },
    '2025-12': {
      'act_1': { '2025-12-01': 16 }, // Newsletter ~16%
      'act_2': { '2025-12-02': 4 },  // Analyzing website ~4%
      'act_4': { '2025-12-03': 11 }, // Product image ~11%
      'act_5': { '2025-12-04': 1 },  // Translation ~1%
      'act_6': { '2025-12-05': 17 }, // Page RTK ~17%
      'act_7': { '2025-12-06': 34 }, // Arduimple page ~34%
      'act_8': { '2025-12-07': 4 },  // Majestic ~4%
      'act_9': { '2025-12-08': 13 }, // Backlinks ~13%
    }
  }
});

// Helper: Convert Excel Serial Date to JS ISO Date String
const excelDateToJSDate = (serial: number): string => {
   // Excel base date is Dec 30 1899
   const utc_days  = Math.floor(serial - 25569);
   const utc_value = utc_days * 86400;
   const date_info = new Date(utc_value * 1000);
   return date_info.toISOString().split('T')[0];
};

// Helper: Normalize any sheet data (Array of Arrays OR Array of Objects) to Array of Arrays
const normalizeToMatrix = (rows: any[]): any[][] => {
  if (!rows || rows.length === 0) return [];
  if (Array.isArray(rows[0])) return rows; 
  
  // It's an array of objects (Legacy sheet_to_json output)
  // We reconstruct headers from the keys of the first row + special keys
  const keys = new Set<string>();
  rows.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
  const headers = Array.from(keys);
  
  // Header row
  const matrix = [headers];
  
  // Data rows
  rows.forEach(r => {
    const rowArray = headers.map(h => r[h]);
    matrix.push(rowArray);
  });
  
  return matrix;
};

// Parser for the custom JSON structure provided
export const parseCustomLegacyFormat = (data: any): Partial<AppState> => {
  const newState: Partial<AppState> = {
    meta: {
      year: 2025,
      userName: 'Marcel',
      lastUpdated: new Date().toISOString()
    },
    activities: [],
    objectives: [],
    news: [],
    hours: {}
  };

  const activityMap = new Map<string, Activity>(); // Name -> Activity

  const getOrCreateActivityId = (name: string): string => {
    if (!name || typeof name !== 'string') return '';
    const cleanName = name.trim();
    if (cleanName === '' || cleanName.toLowerCase() === 'total' || cleanName.toLowerCase() === 'sum') return '';

    if (activityMap.has(cleanName)) return activityMap.get(cleanName)!.id;
    
    const colors = ['#3b82f6', '#f97316', '#a8a29e', '#f59e0b', '#06b6d4', '#84cc16', '#eab308', '#78716c', '#ec4899', '#6366f1'];
    const id = `act_${generateId()}`;
    const newAct: Activity = {
      id,
      name: cleanName,
      color: colors[activityMap.size % colors.length],
      isActive: true,
      description: ''
    };
    activityMap.set(cleanName, newAct);
    return id;
  };

  const getSheetData = (keyFragment: string): any[][] | null => {
    const actualKey = Object.keys(data).find(k => k.toLowerCase().includes(keyFragment.toLowerCase()));
    if (!actualKey) return null;
    return normalizeToMatrix(data[actualKey]);
  };

  const parseHeaderDate = (val: any): { month: number, day: number } | null => {
    // 1. Excel Serial Number
    if (typeof val === 'number' && val > 20000) {
       const dateStr = excelDateToJSDate(val);
       const [y, m, d] = dateStr.split('-').map(Number);
       return { month: m, day: d };
    }
    // 2. String Format "1-Nov", "30-Oct", "01-Nov-25"
    if (typeof val === 'string') {
        const clean = val.trim();
        // Regex for Day-Month (1-Nov, 01-Nov, 1/Nov)
        // Also supports Day-Month-Year (01-Nov-25)
        const match = clean.match(/^(\d{1,2})[-/]([a-zA-Z]{3}|\d{2})(?:[-/]\d{2,4})?/);
        if (match) {
            const d = parseInt(match[1]);
            const mStr = match[2].toLowerCase();
            const months: Record<string, number> = {jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12};
            
            let m = months[mStr];
            if (!m && !isNaN(parseInt(mStr))) m = parseInt(mStr); 
            
            if (m && m >= 1 && m <= 12) return { month: m, day: d };
        }
    }
    return null;
  };

  // 1. Parse Hours Sheets
  const monthConfigs = [
    { fragment: 'hours october', monthNum: 10, year: 2025 },
    { fragment: 'hours november', monthNum: 11, year: 2025 },
    { fragment: 'hours december', monthNum: 12, year: 2025 }
  ];

  monthConfigs.forEach(({ fragment, monthNum, year }) => {
     const matrix = getSheetData(fragment);
     if (!matrix) return;

     const monthKey = `${year}-${String(monthNum).padStart(2,'0')}`;
     if (!newState.hours![monthKey]) newState.hours![monthKey] = {};

     // Locate Header Row
     // Look for row containing "Activity" OR multiple date-like columns
     let headerRowIdx = -1;
     let activityColIdx = -1;
     const dateColIndices: Record<number, string> = {}; // colIdx -> "YYYY-MM-DD"

     for(let r=0; r < Math.min(matrix.length, 10); r++) {
         const row = matrix[r];
         let foundDateCols = 0;
         
         row.forEach((cell, idx) => {
             if (typeof cell === 'string' && cell.toLowerCase().includes('activity')) {
                 activityColIdx = idx;
             }
             const dateInfo = parseHeaderDate(cell);
             if (dateInfo && dateInfo.month === monthNum) {
                 foundDateCols++;
             }
         });

         if (foundDateCols > 3) {
             headerRowIdx = r;
             // If activity column not explicit, assume col 0 if it's text
             if (activityColIdx === -1 && typeof row[0] === 'string') activityColIdx = 0;
             break;
         }
     }

     if (headerRowIdx === -1) return; // No headers found

     // Map Headers
     const headerRow = matrix[headerRowIdx];
     headerRow.forEach((cell, idx) => {
         const d = parseHeaderDate(cell);
         if (d && d.month === monthNum) {
             const dateStr = `${year}-${String(d.month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`;
             dateColIndices[idx] = dateStr;
         }
     });

     // Read Data
     for (let r = headerRowIdx + 1; r < matrix.length; r++) {
         const row = matrix[r];
         const actName = row[activityColIdx];
         
         const actId = getOrCreateActivityId(actName);
         if (!actId) continue;

         if (!newState.hours![monthKey][actId]) newState.hours![monthKey][actId] = {};

         Object.entries(dateColIndices).forEach(([colIdx, dateStr]) => {
             const valRaw = row[parseInt(colIdx)];
             let val = 0;
             if (typeof valRaw === 'number') val = valRaw;
             else if (typeof valRaw === 'string') {
                 // Clean string (e.g. "8.5", "8,5")
                 val = parseFloat(valRaw.replace(',', '.'));
             }
             
             if (!isNaN(val) && val > 0) {
                 newState.hours![monthKey][actId][dateStr] = val;
             }
         });
     }
  });

  newState.activities = Array.from(activityMap.values());

  // 2. Parse Objectives & News (Main Sheet)
  const mainMatrix = getSheetData("Marcel 2025 monthly report");
  if (mainMatrix) {
     // Scanning strategies for Objectives section
     let objStartRow = -1;
     for (let r=0; r < mainMatrix.length; r++) {
         const cell = String(mainMatrix[r][0] || '');
         if (cell.toLowerCase().includes('objectives for 2025')) {
             objStartRow = r + 1; 
             break;
         }
     }

     if (objStartRow !== -1) {
         // Headers for objectives often in objStartRow
         // Assuming specific column offsets based on typical Excel dump
         // Desc: 0, Target: 1, Status: 2, Oct: 3, Note: 4, Nov: 5 ...
         // We'll iterate rows until we hit "News"
         
         for (let r = objStartRow + 1; r < mainMatrix.length; r++) {
             const row = mainMatrix[r];
             const firstCell = String(row[0] || '');
             if (firstCell.toLowerCase().includes('news of the month')) break;
             
             // Try to identify description column (usually longest string)
             // Simple fallback: Col 0 is description
             const desc = row[0];
             if (desc && typeof desc === 'string' && desc.length > 5) {
                 // Check if it's already added
                 const existing = newState.objectives?.find(o => o.description === desc);
                 if (!existing) {
                     const obj: Objective = {
                        id: `obj_${generateId()}`,
                        description: desc,
                        target: 1,
                        status: 'In Progress',
                        monthlyData: {
                            '2025-10': { progress: typeof row[3] === 'number' ? row[3] : 0, note: String(row[4] || '') },
                            '2025-11': { progress: typeof row[5] === 'number' ? row[5] : 0, note: String(row[6] || '') },
                            '2025-12': { progress: typeof row[7] === 'number' ? row[7] : 0, note: String(row[8] || '') },
                        }
                     };
                     // Simple Status Heuristic
                     const totalProg = Object.values(obj.monthlyData).reduce((a,b) => a + b.progress, 0);
                     if (totalProg >= 0.99) obj.status = 'Completed';
                     
                     newState.objectives?.push(obj);
                 }
             }
         }
     }

     // Parse News
     // Look for rows with date in col 0 and text in col 1
     // Or col 0 has Date (number), col 1 has Text
     mainMatrix.forEach(row => {
         const cell0 = row[0];
         if (typeof cell0 === 'number' && cell0 > 40000) {
             const dateStr = excelDateToJSDate(cell0);
             const text = row[1]; // Assuming col 1 is text
             if (text && typeof text === 'string') {
                 newState.news?.push({
                     id: `news_${generateId()}`,
                     date: dateStr,
                     text: text,
                     tags: []
                 });
             }
         }
     });
  }

  return newState;
};

// --- New Export/Import Helpers ---

export const exportToCSV = (state: AppState): string => {
  const sections: string[] = [];

  // META
  sections.push('[META]');
  sections.push('year,userName,lastUpdated');
  sections.push(`${state.meta.year},${state.meta.userName},${state.meta.lastUpdated}`);
  sections.push('');

  // ACTIVITIES
  sections.push('[ACTIVITIES]');
  sections.push('id,name,description,color,isActive');
  state.activities.forEach(a => {
    // escape commas
    const name = a.name.replace(/,/g, ';');
    const desc = (a.description || '').replace(/,/g, ';');
    sections.push(`${a.id},${name},${desc},${a.color},${a.isActive}`);
  });
  sections.push('');

  // OBJECTIVES
  sections.push('[OBJECTIVES]');
  sections.push('id,description,target,status,deadline');
  state.objectives.forEach(o => {
    const desc = o.description.replace(/,/g, ';').replace(/\n/g, ' ');
    const deadline = o.deadline || '';
    sections.push(`${o.id},${desc},${o.target},${o.status},${deadline}`);
  });
  sections.push('');

  // OBJECTIVES_MONTHLY
  sections.push('[OBJECTIVES_MONTHLY]');
  sections.push('objectiveId,month,progress,note');
  state.objectives.forEach(o => {
    Object.entries(o.monthlyData).forEach(([month, data]) => {
      const note = data.note.replace(/,/g, ';').replace(/\n/g, ' ');
      sections.push(`${o.id},${month},${data.progress},${note}`);
    });
  });
  sections.push('');

  // NEWS
  sections.push('[NEWS]');
  sections.push('id,date,text,tags');
  state.news.forEach(n => {
    const text = n.text.replace(/,/g, ';').replace(/\n/g, ' ');
    const tags = n.tags.join('|');
    sections.push(`${n.id},${n.date},${text},${tags}`);
  });
  sections.push('');

  // HOURS
  sections.push('[HOURS]');
  sections.push('month,activityId,date,hours');
  Object.entries(state.hours).forEach(([month, actMap]) => {
    Object.entries(actMap).forEach(([actId, dateMap]) => {
      Object.entries(dateMap).forEach(([date, hours]) => {
        sections.push(`${month},${actId},${date},${hours}`);
      });
    });
  });

  return sections.join('\n');
};

export const parseCSV = (text: string): Partial<AppState> => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const state: Partial<AppState> = {
    activities: [],
    objectives: [],
    news: [],
    hours: {}
  };
  
  let currentSection = '';
  const objectivesMap = new Map<string, Objective>();

  lines.forEach(line => {
    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1);
      return;
    }
    // Simple header skip
    if (line.includes('year,userName') || 
        line.includes('id,name,description') || 
        line.includes('id,description,target') ||
        line.includes('objectiveId,month') ||
        line.includes('id,date,text') ||
        line.includes('month,activityId')) {
      return;
    }

    const parts = line.split(',');
    if (parts.length < 2) return;

    if (currentSection === 'META') {
       if (!state.meta) state.meta = { year: 2025, userName: 'User', lastUpdated: new Date().toISOString() };
       state.meta.year = parseInt(parts[0]) || 2025;
       state.meta.userName = parts[1] || 'User';
       state.meta.lastUpdated = parts[2] || new Date().toISOString();
    } else if (currentSection === 'ACTIVITIES') {
       const [id, name, description, color, isActive] = parts;
       state.activities?.push({
         id,
         name: name.replace(/;/g, ','),
         description: description ? description.replace(/;/g, ',') : '',
         color,
         isActive: isActive === 'true'
       });
    } else if (currentSection === 'OBJECTIVES') {
       const [id, description, target, status, deadline] = parts;
       const obj: Objective = {
         id,
         description: description.replace(/;/g, ','),
         target: parseFloat(target) || 1,
         status: status as any,
         deadline: deadline || undefined,
         monthlyData: {}
       };
       objectivesMap.set(id, obj);
       state.objectives?.push(obj);
    } else if (currentSection === 'OBJECTIVES_MONTHLY') {
       const [objId, month, progress, note] = parts;
       const obj = objectivesMap.get(objId);
       if (obj) {
         obj.monthlyData[month] = {
           progress: parseFloat(progress) || 0,
           note: note ? note.replace(/;/g, ',') : ''
         };
       }
    } else if (currentSection === 'NEWS') {
       const [id, date, text, tagsStr] = parts;
       state.news?.push({
         id,
         date,
         text: text.replace(/;/g, ','),
         tags: tagsStr ? tagsStr.split('|') : []
       });
    } else if (currentSection === 'HOURS') {
       const [month, actId, date, hours] = parts;
       if (!state.hours![month]) state.hours![month] = {};
       if (!state.hours![month][actId]) state.hours![month][actId] = {};
       state.hours![month][actId][date] = parseFloat(hours);
    }
  });

  return state;
};

export const parseExcel = (file: File): Promise<Partial<AppState>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        // Read as Array of Arrays (header: 1) for better raw data control
        const workbook = XLSX.read(data, { type: 'array' });
        const result: any = {};
        
        workbook.SheetNames.forEach(sheetName => {
          const rowData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
          result[sheetName] = rowData;
        });

        // Check for Legacy format (relaxed check)
        const hasLegacySheets = Object.keys(result).some(k => 
           k.toLowerCase().includes('monthly report') || k.toLowerCase().includes('hours ')
        );

        if (hasLegacySheets) {
           resolve(parseCustomLegacyFormat(result));
        } else {
           resolve({}); 
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
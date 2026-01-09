export interface Activity {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
}

export interface Objective {
  id: string;
  description: string;
  target: number; // 1 for 100%
  monthlyData: {
    [monthKey: string]: {
      progress: number;
      note: string;
    }
  };
  status: 'In Progress' | 'Completed' | 'Blocked';
  deadline?: string;
}

export interface NewsItem {
  id: string;
  date: string;
  text: string;
  tags: string[];
}

// Hours are stored as: { "2025-10": { "activity-id": { "2025-10-01": 8.5 } } }
export interface HoursData {
  [monthKey: string]: {
    [activityId: string]: {
      [dateStr: string]: number;
    }
  }
}

export interface AppState {
  meta: {
    year: number;
    userName: string;
    lastUpdated: string;
  };
  activities: Activity[];
  objectives: Objective[];
  news: NewsItem[];
  hours: HoursData;
  settings: {
    theme: 'light' | 'dark';
    hourLimitPerDay: number;
    currentMonth: string; // "YYYY-MM"
  };
}

export interface DailyTotal {
  date: string;
  total: number;
}

export interface ActivityTotal {
  activityId: string;
  total: number;
  percentage: number;
}

export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  OBJECTIVES = 'OBJECTIVES',
  NEWS = 'NEWS',
  SETTINGS = 'SETTINGS'
}
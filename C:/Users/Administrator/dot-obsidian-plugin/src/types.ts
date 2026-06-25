export type TemplateType = 'check' | 'count' | 'target' | 'heatmap' | 'trend';

export interface Project {
  id: string;
  name: string;
  filePath: string;
  type: TemplateType;
  target?: number;
  unit?: string;
  color: string;
  archived: boolean;
  sortOrder: number;
  emoji?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackRecord {
  date: string;      // YYYY-MM-DD
  value?: number;
  note?: string;
  completed: boolean;
  attachments?: string[];
}

export interface DayData {
  date: string;
  records: TrackRecord[];
}

export interface LayoutItem {
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface LayoutConfig {
  gridCols: 3 | 4 | 5 | 6;
  items: Record<string, LayoutItem>;
}

export interface PluginSettings {
  defaultView: 'board' | 'week' | 'month' | 'rank';
  gridCols: 3 | 4 | 5 | 6;
  accentColor: string;
  startOnLaunch: boolean;
  quickTap: boolean;
  addTimestamp: boolean;
  useProperties: boolean;
}

export interface ProjectData {
  projects: Project[];
  layout: LayoutConfig;
  settings: PluginSettings;
}

export interface TemplateConfig {
  type: TemplateType;
  label: string;
  description: string;
  hasValue: boolean;
  hasTarget: boolean;
  hasUnit: boolean;
  hasNote: boolean;
}

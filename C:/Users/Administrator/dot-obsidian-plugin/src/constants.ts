import type { TemplateConfig, PluginSettings } from './types';

export const TEMPLATES: Record<string, TemplateConfig> = {
  check: {
    type: 'check',
    label: '打卡确认',
    description: '简单勾选是否完成',
    hasValue: false,
    hasTarget: false,
    hasUnit: false,
    hasNote: true,
  },
  count: {
    type: 'count',
    label: '计数',
    description: '记录数值（分钟、页数、杯数等）',
    hasValue: true,
    hasTarget: false,
    hasUnit: true,
    hasNote: true,
  },
  target: {
    type: 'target',
    label: '目标进度',
    description: '设定目标值，记录完成进度',
    hasValue: true,
    hasTarget: true,
    hasUnit: true,
    hasNote: true,
  },
  heatmap: {
    type: 'heatmap',
    label: '热力图',
    description: '按日期频次统计',
    hasValue: false,
    hasTarget: false,
    hasUnit: false,
    hasNote: false,
  },
  trend: {
    type: 'trend',
    label: '趋势',
    description: '记录数值并显示趋势线',
    hasValue: true,
    hasTarget: false,
    hasUnit: true,
    hasNote: true,
  },
};

export const DEFAULT_COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0',
  '#00BCD4', '#FF5722', '#795548', '#607D8B', '#CDDC39',
];

export const DEFAULT_SETTINGS: PluginSettings = {
  defaultView: 'board',
  gridCols: 4,
  accentColor: '#4CAF50',
  startOnLaunch: false,
  quickTap: false,
  addTimestamp: false,
  useProperties: true,
};

export const VIEW_TYPE_DOT = 'dot-view';

export const SQUARE_CONFIG_PREFIX = 'square-';

export const MAX_RECORD_DAYS = 365;

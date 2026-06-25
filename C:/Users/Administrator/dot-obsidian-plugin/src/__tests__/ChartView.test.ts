import { describe, it, expect, beforeEach } from 'vitest';
import type { DayData, Project } from '../types';
import {
  renderChartHost,
  renderStats,
  renderHeatmap,
  renderLineChart,
  renderFullCharts,
} from '../components/ChartView';

// ---------------------------------------------------------------------------
// Obsidian DOM polyfills – these methods are provided by Obsidian at runtime
// but are not present in the jsdom environment used by Vitest.
// ---------------------------------------------------------------------------
function polyfillObsidianDom(): void {
  if (!HTMLElement.prototype.addClass) {
    HTMLElement.prototype.addClass = function (this: HTMLElement, ...classes: string[]) {
      this.classList.add(...classes);
    };
  }
  if (!HTMLElement.prototype.empty) {
    HTMLElement.prototype.empty = function (this: HTMLElement) {
      this.innerHTML = '';
    };
  }
}

polyfillObsidianDom();

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const mockProject: Project = {
  id: 'reading',
  name: '阅读',
  filePath: 'reading.md',
  type: 'count',
  target: 30,
  unit: '分钟',
  color: '#4CAF50',
  archived: false,
  sortOrder: 0,
  createdAt: '2026-01-01',
  updatedAt: '2026-06-26',
};

const sampleDays: DayData[] = [
  {
    date: '2026-06-26',
    records: [
      { date: '2026-06-26', completed: true, value: 30 },
      { date: '2026-06-26', completed: true, value: 15 },
    ],
  },
  {
    date: '2026-06-25',
    records: [
      { date: '2026-06-25', completed: true, value: 20 },
    ],
  },
  {
    date: '2026-06-24',
    records: [
      { date: '2026-06-24', completed: false },
    ],
  },
  {
    date: '2026-06-23',
    records: [
      { date: '2026-06-23', completed: true, value: 25 },
    ],
  },
];

const emptyDays: DayData[] = [];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('renderChartHost', () => {
  it('returns a div with the chart-host class and is-pending class', () => {
    const el = renderChartHost();
    expect(el.className).toContain('square-note-chart-host');
    expect(el.className).toContain('is-pending');
  });

  it('creates 3 skeleton children', () => {
    const el = renderChartHost();
    expect(el.children.length).toBe(3);
  });

  it('each skeleton has class square-note-chart-skeleton and height 80px', () => {
    const el = renderChartHost();
    for (let i = 0; i < 3; i++) {
      const child = el.children[i] as HTMLElement;
      expect(child.className).toBe('square-note-chart-skeleton');
      expect(child.style.height).toBe('80px');
    }
  });
});

describe('renderStats', () => {
  it('returns root element with square-note-chart-stats class', () => {
    const el = renderStats(sampleDays, 30);
    expect(el.className).toBe('square-note-chart-stats');
  });

  it('creates 4 stat cards', () => {
    const el = renderStats(sampleDays, 30);
    const cards = el.querySelectorAll('.square-note-chart-stat');
    expect(cards.length).toBe(4);
  });

  it('displays correct completion rate (3/30 = 10%)', () => {
    const el = renderStats(sampleDays, 30);
    const values = el.querySelectorAll('.square-note-chart-value');
    // 3 completed days out of 30 total = 10%
    expect(values[0].textContent).toBe('10%');
  });

  it('displays correct check-in day count', () => {
    const el = renderStats(sampleDays, 30);
    const values = el.querySelectorAll('.square-note-chart-value');
    expect(values[1].textContent).toBe('4');
  });

  it('displays correct cumulative value (30+15+20+25 = 90)', () => {
    const el = renderStats(sampleDays, 30);
    const values = el.querySelectorAll('.square-note-chart-value');
    expect(values[2].textContent).toBe('90');
  });

  it('displays correct streak (2 consecutive completed days from today)', () => {
    const el = renderStats(sampleDays, 30);
    const values = el.querySelectorAll('.square-note-chart-value');
    // Sorted: 06-26 (completed), 06-25 (completed), 06-24 (not completed), 06-23 (completed)
    // Streak counts consecutive completed days from most recent: 06-26 and 06-25 = 2
    expect(values[3].textContent).toBe('2');
  });

  it('handles empty days array', () => {
    const el = renderStats(emptyDays, 30);
    const values = el.querySelectorAll('.square-note-chart-value');
    expect(values[0].textContent).toBe('0%');
    expect(values[1].textContent).toBe('0');
    expect(values[2].textContent).toBe('0');
    expect(values[3].textContent).toBe('0');
  });

  it('handles zero totalDays', () => {
    const el = renderStats(sampleDays, 0);
    const values = el.querySelectorAll('.square-note-chart-value');
    expect(values[0].textContent).toBe('0%');
  });

  it('creates stat cards with label and value span children', () => {
    const el = renderStats(sampleDays, 30);
    const card = el.querySelector('.square-note-chart-stat')!;
    const label = card.querySelector('.square-note-chart-stat-label');
    const value = card.querySelector('.square-note-chart-value');
    expect(label).not.toBeNull();
    expect(value).not.toBeNull();
  });
});

describe('renderHeatmap', () => {
  it('returns root element with square-note-chart-card class', () => {
    const el = renderHeatmap(sampleDays, 2026, 5);
    expect(el.className).toBe('square-note-chart-card');
  });

  it('displays correct year/month caption', () => {
    const el = renderHeatmap(sampleDays, 2026, 5);
    const caption = el.querySelector('.square-note-chart-caption');
    expect(caption?.textContent).toBe('2026年6月');
  });

  it('creates a grid with square-note-chart-heatmap class', () => {
    const el = renderHeatmap(sampleDays, 2026, 5);
    const grid = el.querySelector('.square-note-chart-heatmap') as HTMLElement;
    expect(grid).not.toBeNull();
    expect(grid.style.gridTemplateColumns).toBe('repeat(7, 1fr)');
  });

  it('renders 7 day-of-week headers', () => {
    const el = renderHeatmap(sampleDays, 2026, 5);
    const headers = el.querySelectorAll('.square-note-chart-heatmap-header');
    expect(headers.length).toBe(7);
    expect(headers[0].textContent).toBe('一');
    expect(headers[6].textContent).toBe('日');
  });

  it('renders legend with 6 items', () => {
    const el = renderHeatmap(sampleDays, 2026, 5);
    const legend = el.querySelector('.square-note-chart-legend');
    expect(legend).not.toBeNull();
    expect(legend!.children.length).toBe(6);
  });

  it('marks completed days with is-on class and correct heat level', () => {
    // June 2026 starts on Monday (2026-06-01 is Monday)
    // 2026-06-23 (Tue), 2026-06-24 (Wed), 2026-06-25 (Thu), 2026-06-26 (Fri)
    const el = renderHeatmap(sampleDays, 2026, 5);
    const cells = el.querySelectorAll('.square-note-chart-heatmap-cell');
    const cellTitles = Array.from(cells).map(c => (c as HTMLElement).title);

    // June 23 has 1 completed record -> heat-1
    const jun23Cell = cells[cellTitles.findIndex(t => t.startsWith('2026-06-23'))];
    expect(jun23Cell.className).toContain('heat-1');
    expect(jun23Cell.className).toContain('is-on');

    // June 24 has 0 completed -> no heat class
    const jun24Cell = cells[cellTitles.findIndex(t => t.startsWith('2026-06-24'))];
    expect(jun24Cell.className).not.toContain('is-on');

    // June 26 has 2 completed records -> heat-2
    const jun26Cell = cells[cellTitles.findIndex(t => t.startsWith('2026-06-26'))];
    expect(jun26Cell.className).toContain('heat-2');
    expect(jun26Cell.className).toContain('is-on');
  });

  it('caps heat level at 5', () => {
    // Create a day with 10 completed records
    const heavyDays: DayData[] = [{
      date: '2026-06-15',
      records: Array.from({ length: 10 }, () => ({
        date: '2026-06-15',
        completed: true,
      })),
    }];
    const el = renderHeatmap(heavyDays, 2026, 5);
    const cells = el.querySelectorAll('.square-note-chart-heatmap-cell');
    const cellTitles = Array.from(cells).map(c => (c as HTMLElement).title);
    const jun15Cell = cells[cellTitles.findIndex(t => t.startsWith('2026-06-15'))];
    // Level should be capped at 5
    expect(jun15Cell.className).toContain('heat-5');
  });

  it('shows empty cells before the first day of month', () => {
    // 2026-06-01 is Monday, so adjustedFirst = 0, no empty cells
    // 2026-05-01 is Friday, adjustedFirst = 4
    const el = renderHeatmap(sampleDays, 2026, 4);
    const emptyCells = el.querySelectorAll('.square-note-chart-heatmap-empty');
    expect(emptyCells.length).toBeGreaterThan(0);
  });
});

describe('renderLineChart', () => {
  it('returns root element with square-note-chart-card class', () => {
    const el = renderLineChart(sampleDays, mockProject);
    expect(el.className).toBe('square-note-chart-card');
  });

  it('displays project name in caption', () => {
    const el = renderLineChart(sampleDays, mockProject);
    const caption = el.querySelector('.square-note-chart-caption');
    expect(caption?.textContent).toBe('阅读 趋势');
  });

  it('creates an SVG element', () => {
    const el = renderLineChart(sampleDays, mockProject);
    const svg = el.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 600 200');
  });

  it('shows placeholder text when less than 2 data points', () => {
    const el = renderLineChart(emptyDays, mockProject);
    const svgText = el.querySelector('svg text');
    expect(svgText?.textContent).toBe('数据不足，暂无法显示图表');
  });

  it('draws grid lines when enough data points exist', () => {
    const el = renderLineChart(sampleDays, mockProject);
    const lines = el.querySelectorAll('line');
    // 4 grid lines + potentially 1 target line = 5
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });

  it('draws area polygon', () => {
    const el = renderLineChart(sampleDays, mockProject);
    const area = el.querySelector('polygon');
    expect(area).not.toBeNull();
    expect(area?.getAttribute('fill')).toContain(mockProject.color);
  });

  it('draws line polyline', () => {
    const el = renderLineChart(sampleDays, mockProject);
    // First polygon is area, second polyline is the line
    const polylines = el.querySelectorAll('polyline');
    expect(polylines.length).toBe(1);
    expect(polylines[0].getAttribute('stroke')).toBe(mockProject.color);
  });

  it('draws data point circles when enough values', () => {
    const el = renderLineChart(sampleDays, mockProject);
    const circles = el.querySelectorAll('circle');
    // 3 circles for 3 days with values > 0
    expect(circles.length).toBe(3);
    circles.forEach(c => {
      expect(c.getAttribute('fill')).toBe(mockProject.color);
    });
  });

  it('draws target line when project.target is set', () => {
    const el = renderLineChart(sampleDays, mockProject);
    const lines = el.querySelectorAll('line');
    // 4 grid lines + 1 target line
    const dashLines = Array.from(lines).filter(
      l => l.getAttribute('stroke-dasharray') === '6 3'
    );
    expect(dashLines.length).toBe(1);
  });

  it('does not draw target line when project.target is undefined', () => {
    const projNoTarget: Project = { ...mockProject, target: undefined };
    const el = renderLineChart(sampleDays, projNoTarget);
    const lines = el.querySelectorAll('line');
    const dashLines = Array.from(lines).filter(
      l => l.getAttribute('stroke-dasharray') === '6 3'
    );
    expect(dashLines.length).toBe(0);
  });

  it('filters out zero values', () => {
    // Create record with value=0
    const daysWithZero: DayData[] = [
      { date: '2026-06-26', records: [{ date: '2026-06-26', completed: true, value: 0 }] },
      { date: '2026-06-25', records: [{ date: '2026-06-25', completed: true, value: 10 }] },
      { date: '2026-06-24', records: [{ date: '2026-06-24', completed: true, value: 20 }] },
    ];
    const el = renderLineChart(daysWithZero, mockProject);
    const circles = el.querySelectorAll('circle');
    // 2 circles for 2 non-zero values
    expect(circles.length).toBe(2);
  });
});

describe('renderFullCharts', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  it('appends charts into the container', () => {
    renderFullCharts(container, sampleDays, mockProject, 2026, 5, 30);
    const root = container.querySelector('.square-note-chart-root');
    expect(root).not.toBeNull();
  });

  it('includes stats, heatmap, and line chart', () => {
    renderFullCharts(container, sampleDays, mockProject, 2026, 5, 30);
    expect(container.querySelector('.square-note-chart-stats')).not.toBeNull();
    expect(container.querySelector('.square-note-chart-heatmap')).not.toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('clears container before rendering', () => {
    container.innerHTML = '<div>existing content</div>';
    renderFullCharts(container, sampleDays, mockProject, 2026, 5, 30);
    expect(container.children.length).toBe(1);
    expect(container.querySelector('.square-note-chart-root')).not.toBeNull();
  });

  it('works with empty days', () => {
    renderFullCharts(container, emptyDays, mockProject, 2026, 5, 30);
    expect(container.querySelector('.square-note-chart-stats')).not.toBeNull();
    expect(container.querySelector('.square-note-chart-heatmap')).not.toBeNull();
    const svgText = container.querySelector('svg text');
    expect(svgText?.textContent).toBe('数据不足，暂无法显示图表');
  });
});

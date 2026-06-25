import type { DayData, Project } from '../types';
import { createDiv, createSpan } from '../utils/dom';
import { calculateCompletionRate, calculateTotalValue } from '../models/Record';
import { getMonthDates, parseDate } from '../utils/date';

export function renderChartHost(): HTMLDivElement {
  const host = createDiv('square-note-chart-host is-pending');
  // Skeleton
  for (let i = 0; i < 3; i++) {
    const skeleton = createDiv('square-note-chart-skeleton');
    skeleton.style.height = '80px';
    host.appendChild(skeleton);
  }
  return host;
}

export function renderStats(days: DayData[], totalDays: number): HTMLElement {
  const root = createDiv('square-note-chart-stats');
  const rate = calculateCompletionRate(days, totalDays);
  const total = calculateTotalValue(days);

  const stats = [
    { label: '完成率', value: `${Math.round(rate * 100)}%` },
    { label: '打卡天数', value: `${days.length}` },
    { label: '累计', value: `${total}` },
    { label: '连续天数', value: `${calculateStreak(days)}` },
  ];

  for (const stat of stats) {
    const card = createDiv('square-note-chart-stat');
    const label = createSpan('square-note-chart-stat-label', stat.label);
    const value = createSpan('square-note-chart-value', stat.value);
    card.appendChild(label);
    card.appendChild(value);
    root.appendChild(card);
  }

  return root;
}

export function renderHeatmap(days: DayData[], year: number, month: number): HTMLElement {
  const root = createDiv('square-note-chart-card');
  const caption = createSpan('square-note-chart-caption', `${year}年${month + 1}月`);
  root.appendChild(caption);

  const grid = createDiv('square-note-chart-heatmap');
  grid.style.gridTemplateColumns = 'repeat(7, 1fr)';

  // Day-of-week headers
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
  dayNames.forEach(d => {
    const h = createSpan('square-note-chart-heatmap-header', d);
    grid.appendChild(h);
  });

  const dates = getMonthDates(year, month);
  const firstDay = parseDate(dates[0]).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;

  // Empty cells before the 1st
  for (let i = 0; i < adjustedFirst; i++) {
    grid.appendChild(createDiv('square-note-chart-heatmap-empty'));
  }

  for (const dateStr of dates) {
    const cell = createDiv('square-note-chart-heatmap-cell');
    const dayData = days.find(d => d.date === dateStr);
    const count = dayData?.records.filter(r => r.completed).length || 0;

    if (count > 0) {
      const level = Math.min(5, count);
      cell.addClass(`heat-${level}`);
      cell.addClass('is-on');
    }
    cell.title = `${dateStr}: ${count} 次打卡`;
    grid.appendChild(cell);
  }

  // Legend
  const legend = createDiv('square-note-chart-legend');
  for (let i = 0; i <= 5; i++) {
    const l = createDiv();
    l.className = i === 0 ? '' : `heat-${i}`;
    l.style.width = '10px';
    l.style.height = '10px';
    l.style.borderRadius = '2px';
    if (i === 0) l.style.background = 'var(--background-secondary)';
    legend.appendChild(l);
  }
  root.appendChild(grid);
  root.appendChild(legend);

  return root;
}

export function renderLineChart(days: DayData[], project: Project): HTMLElement {
  const root = createDiv('square-note-chart-card');

  const caption = createSpan('square-note-chart-caption', `${project.name} 趋势`);
  root.appendChild(caption);

  const svgContainer = createDiv('square-note-chart-svg');
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '200');
  svg.setAttribute('viewBox', '0 0 600 200');

  const values = days
    .map(d => d.records.reduce((s, r) => s + (r.value || 0), 0))
    .filter(v => v > 0);

  if (values.length < 2) {
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', '300');
    text.setAttribute('y', '100');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--text-muted)');
    text.textContent = '数据不足，暂无法显示图表';
    svg.appendChild(text);
  } else {
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const range = maxVal - minVal || 1;
    const padding = 30;
    const w = 540;
    const h = 160;
    const stepX = w / (values.length - 1);
    const scaleY = (v: number) => h - padding - ((v - minVal) / range) * (h - 2 * padding);

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * (h - 2 * padding);
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(w));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', 'var(--background-modifier-border)');
      line.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(line);
    }

    // Area fill
    const points = values.map((v, i) => `${i * stepX},${scaleY(v)}`).join(' ');
    const area = document.createElementNS(svgNS, 'polygon');
    area.setAttribute(
      'points',
      `0,${h} ${values.map((v, i) => `${i * stepX},${scaleY(v)}`).join(' ')} ${(values.length - 1) * stepX},${h}`
    );
    area.setAttribute('fill', `color-mix(in srgb, ${project.color} 20%, transparent)`);
    svg.appendChild(area);

    // Line
    const line = document.createElementNS(svgNS, 'polyline');
    line.setAttribute('points', points);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', project.color);
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);

    // Data points
    values.forEach((v, i) => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', String(i * stepX));
      circle.setAttribute('cy', String(scaleY(v)));
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', project.color);
      svg.appendChild(circle);
    });

    // Target line
    if (project.target) {
      const targetY = scaleY(project.target);
      const tLine = document.createElementNS(svgNS, 'line');
      tLine.setAttribute('x1', '0');
      tLine.setAttribute('y1', String(targetY));
      tLine.setAttribute('x2', String(w));
      tLine.setAttribute('y2', String(targetY));
      tLine.setAttribute('stroke', 'var(--color-red)');
      tLine.setAttribute('stroke-dasharray', '6 3');
      tLine.setAttribute('stroke-width', '1.5');
      svg.appendChild(tLine);
    }
  }

  svgContainer.appendChild(svg);
  root.appendChild(svgContainer);
  return root;
}

function calculateStreak(days: DayData[]): number {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const day of sorted) {
    if (day.records.some(r => r.completed)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function renderFullCharts(
  container: HTMLElement,
  days: DayData[],
  project: Project,
  year: number,
  month: number,
  totalDays: number
): void {
  container.empty();
  const root = createDiv('square-note-chart-root');
  root.appendChild(renderStats(days, totalDays));
  root.appendChild(renderHeatmap(days, year, month));
  root.appendChild(renderLineChart(days, project));
  container.appendChild(root);
}

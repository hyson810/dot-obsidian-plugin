import { createDiv, createSpan } from '../utils/dom';
import type { Project, DayData } from '../types';
import { getWeekDates, toDisplayDate, getDayOfWeek } from '../utils/date';

export function renderWeekView(
  container: HTMLElement,
  projects: Project[],
  allData: Map<string, DayData[]>,
  currentDate: Date
): void {
  container.empty();
  const root = createDiv('square-overview-root');

  // Header
  const header = createDiv('square-overview-header');
  const prevBtn = createSpan('square-overview-nav', '‹');
  const title = createSpan('square-overview-title', `${currentDate.getFullYear()}年 W${getWeekNumber(currentDate)}`);
  const nextBtn = createSpan('square-overview-nav', '›');
  header.appendChild(prevBtn);
  header.appendChild(title);
  header.appendChild(nextBtn);
  root.appendChild(header);

  const weekDates = getWeekDates(currentDate);
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];

  const board = createDiv('square-week-board');
  // Header row
  const headRow = createDiv('square-week-head-row');
  headRow.appendChild(createSpan('square-week-head-cell', '项目'));
  dayNames.forEach(d => headRow.appendChild(createSpan('square-week-head-cell', d)));
  board.appendChild(headRow);

  // Project rows
  for (const project of projects) {
    const row = createDiv('square-week-row');
    row.appendChild(createSpan('square-week-name', project.name));

    for (const dateStr of weekDates) {
      const cell = createDiv('square-week-cell');
      const dayData = allData.get(project.id) || [];
      const records = dayData.filter(d => d.date === dateStr).flatMap(d => d.records);
      const isDone = records.some(r => r.completed);

      if (isDone) cell.addClass('is-on');
      if (dateStr > new Date().toISOString().split('T')[0]) cell.addClass('is-future');

      if (isDone && (project.type === 'count' || project.type === 'trend')) {
        const total = records.reduce((s, r) => s + (r.value || 0), 0);
        cell.appendChild(createSpan('square-week-count', String(total)));
      }

      row.appendChild(cell);
    }
    board.appendChild(row);
  }

  root.appendChild(board);
  container.appendChild(root);
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

import { createDiv, createSpan } from '../utils/dom';
import type { Project, DayData } from '../types';
import { getMonthDates, getDaysInMonth, parseDate } from '../utils/date';

export function renderMonthView(
  container: HTMLElement,
  projects: Project[],
  allData: Map<string, DayData[]>,
  year: number,
  month: number
): void {
  container.empty();
  const root = createDiv('square-overview-root');

  // Header
  const header = createDiv('square-overview-header');
  const prevBtn = createSpan('square-overview-nav', '‹');
  const title = createSpan('square-overview-title', `${year}年${month + 1}月`);
  const nextBtn = createSpan('square-overview-nav', '›');
  header.appendChild(prevBtn);
  header.appendChild(title);
  header.appendChild(nextBtn);
  root.appendChild(header);

  const board = createDiv('square-month-board');
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
  const days = getMonthDates(year, month);
  const firstDay = parseDate(days[0]).getDay();
  const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;

  // Day headers
  dayNames.forEach(d => board.appendChild(createSpan('square-month-day-header', d)));

  // Empty cells
  for (let i = 0; i < adjustedFirst; i++) {
    board.appendChild(createDiv('square-month-day empty'));
  }

  // Day cells
  for (const dateStr of days) {
    const cell = createDiv('square-month-day');
    cell.appendChild(createSpan('square-month-day-num', dateStr.split('-')[2]));

    const isToday = dateStr === new Date().toISOString().split('T')[0];
    if (isToday) cell.addClass('is-today');

    // Show completion dots
    for (const project of projects) {
      const dayData = allData.get(project.id) || [];
      const records = dayData.filter(d => d.date === dateStr).flatMap(d => d.records);
      if (records.some(r => r.completed)) {
        const dot = createDiv('square-month-dot');
        dot.style.background = project.color;
        cell.appendChild(dot);
      }
    }

    board.appendChild(cell);
  }

  root.appendChild(board);
  container.appendChild(root);
}

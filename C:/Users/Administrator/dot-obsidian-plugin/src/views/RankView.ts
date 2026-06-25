import { createDiv, createSpan } from '../utils/dom';
import type { Project, DayData } from '../types';
import { calculateCompletionRate, calculateTotalValue } from '../models/Record';

interface RankEntry {
  project: Project;
  completionRate: number;
  totalValue: number;
  dayCount: number;
  score: number;
}

export function renderRankView(
  container: HTMLElement,
  projects: Project[],
  allData: Map<string, DayData[]>,
  daysInPeriod: number
): void {
  container.empty();
  const root = createDiv('square-overview-root');

  const title = createSpan('square-overview-title', '🏆 排行榜');
  root.appendChild(title);

  const board = createDiv('square-rank-board');

  // Compute scores
  const entries: RankEntry[] = projects.map(project => {
    const dayData = allData.get(project.id) || [];
    const completedDays = dayData.filter(d => d.records.some(r => r.completed));
    return {
      project,
      completionRate: calculateCompletionRate(dayData, daysInPeriod),
      totalValue: calculateTotalValue(dayData),
      dayCount: completedDays.length,
      score: calculateCompletionRate(dayData, daysInPeriod) * 100,
    };
  });

  entries.sort((a, b) => b.score - a.score);

  const medals = ['🥇', '🥈', '🥉'];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const item = createDiv('square-rank-item');

    const index = createSpan('square-rank-index',
      i < 3 ? medals[i] : String(i + 1));
    item.appendChild(index);

    const name = createSpan('square-rank-name', entry.project.name);
    item.appendChild(name);

    const stat = createSpan('square-rank-stat',
      `${Math.round(entry.score)}% · ${entry.dayCount}天`);
    item.appendChild(stat);

    board.appendChild(item);
  }

  root.appendChild(board);
  container.appendChild(root);
}

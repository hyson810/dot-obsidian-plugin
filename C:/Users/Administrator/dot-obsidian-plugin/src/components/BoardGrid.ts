import type { Project, LayoutConfig } from '../types';
import { createDiv } from '../utils/dom';
import { renderBoardItem, type BoardItemHandlers } from './BoardItem';
import { renderEmptyState } from './EmptyState';

export interface BoardData {
  project: Project;
  isDone: boolean;
  dayValue: string | null;
}

export function renderBoardGrid(
  projects: BoardData[],
  layout: LayoutConfig,
  handlers: BoardItemHandlers,
  isSortMode: boolean
): HTMLElement {
  const root = createDiv('square-board-root');
  root.dataset.squareCol = String(layout.gridCols);
  root.style.setProperty('--board-grid-cols', String(layout.gridCols));

  const grid = createDiv('square-board-grid');
  grid.style.gridTemplateColumns = `repeat(${layout.gridCols}, 1fr)`;

  if (projects.length === 0) {
    grid.appendChild(renderEmptyState());
  } else {
    for (const data of projects) {
      const itemLayout = layout.items[data.project.id];
      const el = renderBoardItem(
        data.project,
        itemLayout,
        data.isDone,
        data.dayValue,
        handlers,
        isSortMode
      );
      grid.appendChild(el);
    }
  }

  root.appendChild(grid);
  return root;
}

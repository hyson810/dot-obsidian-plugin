import type { Project, LayoutItem } from '../types';
import { createDiv, createSpan } from '../utils/dom';
import { getContrastColor } from '../utils/color';

export interface BoardItemHandlers {
  onClick: (project: Project) => void;
  onDragStart: (project: Project) => void;
  onResize: (project: Project, width: number, height: number) => void;
  onContextMenu: (project: Project, e: MouseEvent) => void;
}

export function renderBoardItem(
  project: Project,
  layout: LayoutItem,
  isDone: boolean,
  dayValue: string | null,
  handlers: BoardItemHandlers,
  isSortMode: boolean
): HTMLElement {
  const el = createDiv('square-board-item');
  if (isDone) el.addClass('square-board-item-done');
  el.dataset.projectId = project.id;

  // Grid positioning
  if (layout) {
    el.style.gridRow = `${layout.row + 1} / span ${layout.height}`;
    el.style.gridColumn = `${layout.col + 1} / span ${layout.width}`;
  }

  // Background color with theme awareness
  el.style.setProperty('--tile-color', project.color);
  el.style.background = isDone
    ? `color-mix(in srgb, ${project.color} 60%, var(--interactive-accent))`
    : `color-mix(in srgb, ${project.color} 25%, var(--background-secondary))`;

  // Label
  const label = createSpan('square-board-item-label');
  label.textContent = project.name;
  label.style.color = getContrastColor(project.color);
  el.appendChild(label);

  // Count badge
  if (dayValue !== null) {
    const badge = createSpan('square-board-count-badge');
    badge.textContent = dayValue;
    el.appendChild(badge);
  }

  // Resize handle (sort mode only)
  if (isSortMode) {
    const handle = createDiv('square-board-resize-handle');
    el.appendChild(handle);

    let isResizing = false;
    handle.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
      isResizing = true;
      const startX = e.clientX;
      const startW = layout?.width || 1;

      const onMove = (ev: MouseEvent) => {
        if (!isResizing) return;
        const dx = ev.clientX - startX;
        const newW = Math.max(1, Math.min(6, startW + Math.round(dx / 80)));
        el.style.gridColumn = `${(layout?.col || 0) + 1} / span ${newW}`;
      };

      const onUp = () => {
        isResizing = false;
        const colSpan = parseInt(el.style.gridColumn.split('/ span ')[1] || '1');
        handlers.onResize(project, colSpan, layout?.height || 1);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // Click handler
  el.addEventListener('click', () => handlers.onClick(project));

  // Context menu
  el.addEventListener('contextmenu', (e) => handlers.onContextMenu(project, e));

  // Drag (sort mode)
  if (isSortMode) {
    el.draggable = true;
    el.addEventListener('dragstart', () => handlers.onDragStart(project));
  }

  return el;
}

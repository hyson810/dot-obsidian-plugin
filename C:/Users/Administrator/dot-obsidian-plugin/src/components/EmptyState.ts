import { createDiv, createSpan } from '../utils/dom';

export function renderEmptyState(): HTMLElement {
  const el = createDiv('square-board-empty');

  const icon = createSpan('square-board-empty-icon');
  icon.textContent = '📋';
  el.appendChild(icon);

  const text = createSpan('square-board-empty-text');
  text.textContent = '还没有打卡项目';
  el.appendChild(text);

  const hint = createSpan('square-board-empty-hint');
  hint.textContent = '点击上方 + 创建第一个项目';
  el.appendChild(hint);

  return el;
}

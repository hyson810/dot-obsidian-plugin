import type { LayoutConfig, LayoutItem } from '../types';

const DEFAULT_GRID_COLS = 4;

export function createDefaultLayout(): LayoutConfig {
  return {
    gridCols: DEFAULT_GRID_COLS,
    items: {},
  };
}

export function createLayoutItem(row: number, col: number, width = 1, height = 1): LayoutItem {
  return { row, col, width, height };
}

export function autoLayout(
  projectIds: string[],
  gridCols: LayoutConfig['gridCols'],
  existing?: LayoutConfig
): LayoutConfig {
  const config: LayoutConfig = {
    gridCols,
    items: {},
  };

  let row = 0;
  let col = 0;

  for (const id of projectIds) {
    if (existing?.items[id]) {
      config.items[id] = { ...existing.items[id] };
      continue;
    }

    config.items[id] = { row, col, width: 1, height: 1 };
    col++;
    if (col >= gridCols) {
      col = 0;
      row++;
    }
  }

  return config;
}

export function placeItem(
  layout: LayoutConfig,
  id: string,
  item: LayoutItem,
  gridCols: LayoutConfig['gridCols']
): LayoutConfig {
  return {
    ...layout,
    items: {
      ...layout.items,
      [id]: { ...item },
    },
    gridCols,
  };
}

export function removeItem(layout: LayoutConfig, id: string): LayoutConfig {
  const { [id]: _, ...rest } = layout.items;
  return { ...layout, items: rest };
}

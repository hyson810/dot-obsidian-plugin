import type { LayoutConfig, LayoutItem } from '../types';
import { autoLayout, placeItem } from '../models/Layout';
import { DataService } from './DataService';

export class LayoutService {
  constructor(private dataService: DataService) {}

  getLayout(): LayoutConfig {
    return this.dataService.layout;
  }

  getItemPosition(projectId: string): LayoutItem | undefined {
    return this.dataService.layout.items[projectId];
  }

  async moveItem(projectId: string, row: number, col: number): Promise<void> {
    const current = this.dataService.layout.items[projectId];
    if (current) {
      this.dataService.layout = {
        ...this.dataService.layout,
        items: {
          ...this.dataService.layout.items,
          [projectId]: { ...current, row, col },
        },
      };
    }
    await this.dataService.save();
  }

  async resizeItem(projectId: string, width: number, height: number): Promise<void> {
    const current = this.dataService.layout.items[projectId];
    if (current) {
      this.dataService.layout = {
        ...this.dataService.layout,
        items: {
          ...this.dataService.layout.items,
          [projectId]: { ...current, width, height },
        },
      };
    }
    await this.dataService.save();
  }

  async setGridCols(cols: 3 | 4 | 5 | 6): Promise<void> {
    const projectIds = this.dataService.getActiveProjects().map(p => p.id);
    this.dataService.layout = autoLayout(projectIds, cols, this.dataService.layout);
    this.dataService.layout.gridCols = cols;
    await this.dataService.save();
  }

  async resetLayout(): Promise<void> {
    const projectIds = this.dataService.getActiveProjects().map(p => p.id);
    this.dataService.layout = autoLayout(projectIds, this.dataService.layout.gridCols);
    await this.dataService.save();
  }
}

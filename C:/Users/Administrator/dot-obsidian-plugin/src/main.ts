import { Plugin, WorkspaceLeaf } from 'obsidian';
import type { PluginSettings } from './types';
import { VIEW_TYPE_DOT, DEFAULT_SETTINGS } from './constants';
import { DataService } from './services/DataService';
import { MarkdownService } from './services/MarkdownService';
import { LayoutService } from './services/LayoutService';
import { BoardView } from './views/BoardView';
import { DotSettingTab } from './settings';

export default class DotPlugin extends Plugin {
  dataService!: DataService;
  markdownService!: MarkdownService;
  layoutService!: LayoutService;
  settings!: PluginSettings;

  async onload(): Promise<void> {
    // Init services
    this.dataService = new DataService(this);
    await this.dataService.load();
    this.settings = this.dataService.settings;
    this.markdownService = new MarkdownService(this.app.vault);
    this.layoutService = new LayoutService(this.dataService);

    // Register view
    this.registerView(VIEW_TYPE_DOT, (leaf) =>
      new BoardView(leaf, this.markdownService, this.dataService, this.layoutService)
    );

    // Add ribbon icon
    this.addRibbonIcon('check-square', 'DOT', () => {
      this.activateView();
    });

    // Add settings tab
    this.addSettingTab(new DotSettingTab(this.app, this));

    // Add command
    this.addCommand({
      id: 'open-dot',
      name: 'Open DOT dashboard',
      callback: () => this.activateView(),
    });

    // Auto-open on launch if configured
    if (this.settings.startOnLaunch) {
      this.app.workspace.onLayoutReady(() => {
        this.activateView();
      });
    }
  }

  async saveSettings(): Promise<void> {
    this.dataService.settings = this.settings;
    await this.dataService.save();
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType(VIEW_TYPE_DOT).first();
    if (!leaf) {
      const rightLeaf = workspace.getRightLeaf(false);
      if (!rightLeaf) return;
      leaf = rightLeaf;
      await leaf.setViewState({ type: VIEW_TYPE_DOT, active: true });
    }

    workspace.revealLeaf(leaf);
  }

  updateLayout(): void {
    this.layoutService.setGridCols(this.settings.gridCols);
  }

  refreshView(): void {
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_DOT).first();
    if (leaf?.view instanceof BoardView) {
      leaf.view.refresh();
    }
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_DOT);
  }
}

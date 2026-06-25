import { Plugin, type App } from 'obsidian';
import type { PluginSettings, Project, LayoutConfig } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { createDefaultLayout } from '../models/Layout';

interface PersistedData {
  projects: Project[];
  layout: LayoutConfig;
  settings: PluginSettings;
}

export class DataService {
  private data: PersistedData;

  constructor(private plugin: Plugin) {
    this.data = {
      projects: [],
      layout: createDefaultLayout(),
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  async load(): Promise<void> {
    const loaded = await this.plugin.loadData();
    if (loaded) {
      this.data = {
        projects: loaded.projects || [],
        layout: loaded.layout || createDefaultLayout(),
        settings: { ...DEFAULT_SETTINGS, ...(loaded.settings || {}) },
      };
    }
  }

  async save(): Promise<void> {
    await this.plugin.saveData(this.data);
  }

  get settings(): PluginSettings {
    return this.data.settings;
  }

  set settings(s: PluginSettings) {
    this.data.settings = s;
  }

  get projects(): Project[] {
    return this.data.projects;
  }

  set projects(p: Project[]) {
    this.data.projects = p;
  }

  get layout(): LayoutConfig {
    return this.data.layout;
  }

  set layout(l: LayoutConfig) {
    this.data.layout = l;
  }

  getProject(id: string): Project | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  getActiveProjects(): Project[] {
    return this.data.projects
      .filter(p => !p.archived)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getArchivedProjects(): Project[] {
    return this.data.projects.filter(p => p.archived);
  }

  async addProject(project: Project): Promise<void> {
    this.data.projects.push(project);
    await this.save();
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.data.projects[idx] = { ...this.data.projects[idx], ...updates, updatedAt: new Date().toISOString() };
      await this.save();
    }
  }

  async removeProject(id: string): Promise<void> {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    await this.save();
  }

  async archiveProject(id: string): Promise<void> {
    await this.updateProject(id, { archived: true });
  }

  async unarchiveProject(id: string): Promise<void> {
    await this.updateProject(id, { archived: false });
  }
}

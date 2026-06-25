import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { Project, DayData } from '../types';
import { VIEW_TYPE_DOT } from '../constants';
import { renderBoardGrid, type BoardData } from '../components/BoardGrid';
import type { BoardItemHandlers } from '../components/BoardItem';
import { MarkdownService } from '../services/MarkdownService';
import { DataService } from '../services/DataService';
import { LayoutService } from '../services/LayoutService';
import { formatDate, getWeekDates } from '../utils/date';
import { getRecordsForDate } from '../models/Record';
import { createProject } from '../models/Project';
import { EntryModal } from '../components/EntryModal';
import { ProjectSetupModal } from '../components/ProjectSetupModal';
import { renderWeekView } from './WeekView';
import { renderMonthView } from './MonthView';
import { renderRankView } from './RankView';

export class BoardView extends ItemView {
  private markdownService: MarkdownService;
  private dataService: DataService;
  private layoutService: LayoutService;
  private isSortMode = false;
  private currentView: 'board' | 'week' | 'month' | 'rank' = 'board';
  private viewDate = new Date();

  constructor(
    leaf: WorkspaceLeaf,
    markdownService: MarkdownService,
    dataService: DataService,
    layoutService: LayoutService
  ) {
    super(leaf);
    this.markdownService = markdownService;
    this.dataService = dataService;
    this.layoutService = layoutService;
  }

  getViewType(): string {
    return VIEW_TYPE_DOT;
  }

  getDisplayText(): string {
    return 'DOT';
  }

  getIcon(): string {
    return 'check-square';
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async refresh(): Promise<void> {
    await this.render();
  }

  private async render(): Promise<void> {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('square-view');
    containerEl.addClass('square-view-body');

    // Header
    const header = containerEl.createDiv({ cls: 'square-view-header' });
    const dateStr = this.currentView === 'week'
      ? `${this.viewDate.getFullYear()}年 W${getWeekNumber(this.viewDate)}`
      : this.currentView === 'month'
        ? `${this.viewDate.getFullYear()}年${this.viewDate.getMonth() + 1}月`
        : formatDate(new Date());
    header.createSpan({ cls: 'square-view-date', text: dateStr });

    const actions = header.createDiv({ cls: 'square-view-actions' });

    if (this.currentView === 'board') {
      const sortBtn = actions.createEl('button', { cls: 'square-view-btn', text: '排序' });
      sortBtn.addEventListener('click', () => {
        this.isSortMode = !this.isSortMode;
        this.render();
      });

      const addBtn = actions.createEl('button', { cls: 'square-view-btn', text: '+' });
      addBtn.addEventListener('click', () => this.handleAddProject());
    }

    // Content based on current view
    if (this.currentView === 'board') {
      const projects = await this.buildBoardData();
      const layout = this.layoutService.getLayout();
      const obj: BoardItemHandlers = {
        onClick: p => this.handleProjectClick(p),
        onDragStart: p => {},
        onResize: (p, w, h) => this.layoutService.resizeItem(p.id, w, h),
        onContextMenu: (p, e) => this.showContextMenu(p, e),
      };
      const board = renderBoardGrid(projects, layout, obj, this.isSortMode);
      containerEl.appendChild(board);
    } else {
      const allData = new Map<string, DayData[]>();
      const projects = this.dataService.getActiveProjects();
      const today = formatDate(new Date());

      if (this.currentView === 'week') {
        const weekDates = getWeekDates(this.viewDate);
        for (const project of projects) {
          const days = await this.markdownService.getRecords(project.filePath, weekDates[0], weekDates[6]);
          allData.set(project.id, days);
        }
        renderWeekView(containerEl, projects, allData, this.viewDate);
      } else if (this.currentView === 'month') {
        const startDate = `${this.viewDate.getFullYear()}-${String(this.viewDate.getMonth() + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0).getDate();
        const endDate = `${this.viewDate.getFullYear()}-${String(this.viewDate.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
        for (const project of projects) {
          const days = await this.markdownService.getRecords(project.filePath, startDate, endDate);
          allData.set(project.id, days);
        }
        renderMonthView(containerEl, projects, allData, this.viewDate.getFullYear(), this.viewDate.getMonth());
      } else if (this.currentView === 'rank') {
        const allDays = await Promise.all(
          projects.map(p => this.markdownService.getRecords(p.filePath)
            .then(days => ({ id: p.id, days }))
            .catch(() => ({ id: p.id, days: [] })))
        );
        for (const { id, days } of allDays) {
          allData.set(id, days);
        }
        renderRankView(containerEl, projects, allData, 30);
      }
    }

    // Navigation footer
    const nav = containerEl.createDiv({ cls: 'square-view-nav' });
    const views = [
      { key: 'board' as const, label: '📋 今日' },
      { key: 'week' as const, label: '📅 本周' },
      { key: 'month' as const, label: '📆 本月' },
      { key: 'rank' as const, label: '🏆 排行' },
    ];

    for (const v of views) {
      const btn = nav.createEl('button', {
        cls: `square-view-nav-btn${this.currentView === v.key ? ' is-active' : ''}`,
        text: v.label,
      });
      btn.addEventListener('click', () => {
        this.currentView = v.key;
        this.render();
      });
    }
  }

  private async buildBoardData(): Promise<BoardData[]> {
    const projects = this.dataService.getActiveProjects();
    const today = formatDate(new Date());
    const result: BoardData[] = [];

    for (const project of projects) {
      try {
        const days = await this.markdownService.getRecords(project.filePath, today, today);
        const records = getRecordsForDate(days, today);
        const isDone = records.some(r => r.completed);
        const totalValue = records.reduce((s, r) => s + (r.value || 0), 0);
        const dayValue = isDone
          ? project.type === 'count' || project.type === 'trend'
            ? `${totalValue}${project.unit || ''}`
            : '✔'
          : null;
        result.push({ project, isDone, dayValue });
      } catch {
        result.push({ project, isDone: false, dayValue: null });
      }
    }

    return result;
  }

  private async handleProjectClick(project: Project): Promise<void> {
    if (this.dataService.settings.quickTap) {
      // Quick tap: directly record
      await this.markdownService.appendRecord(project.filePath, formatDate(new Date()), {
        date: formatDate(new Date()),
        completed: true,
      });
      this.render();
      return;
    }

    const modal = new EntryModal(this.app, project);
    const record = await modal.open();
    if (record) {
      await this.markdownService.appendRecord(project.filePath, record.date, record);
      this.render();
    }
  }

  private async handleAddProject(): Promise<void> {
    const modal = new ProjectSetupModal(this.app);
    const result = await modal.open();
    if (!result) return;

    const file = await this.markdownService.ensureFile(result.filePath, result.name);
    const project = createProject(
      result.name,
      file.path,
      result.type,
      result.color,
      result.target,
      result.unit,
      result.emoji
    );

    await this.markdownService.writeConfig(file.path, project);
    await this.dataService.addProject(project);
    this.render();
  }

  private showContextMenu(project: Project, event: MouseEvent): void {
    const menu = this.containerEl.createDiv({ cls: 'square-context-menu' });
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;

    const items = [
      { label: project.archived ? '取消归档' : '归档', action: () => this.handleArchive(project) },
      { label: '删除项目', action: () => this.handleDeleteProject(project) },
    ];

    for (const item of items) {
      const el = menu.createDiv({ cls: 'square-context-menu-item', text: item.label });
      el.addEventListener('click', () => {
        menu.remove();
        item.action();
      });
    }

    // Close on click outside
    const closeMenu = (e: MouseEvent) => {
      if (!menu.contains(e.target as Node)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  private async handleArchive(project: Project): Promise<void> {
    if (project.archived) {
      await this.dataService.unarchiveProject(project.id);
    } else {
      await this.dataService.archiveProject(project.id);
    }
    this.render();
  }

  private async handleDeleteProject(project: Project): Promise<void> {
    await this.dataService.removeProject(project.id);
    this.render();
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

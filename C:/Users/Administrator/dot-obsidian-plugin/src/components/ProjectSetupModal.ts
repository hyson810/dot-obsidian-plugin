import { Modal, App } from 'obsidian';
import type { Project, TemplateType } from '../types';
import { getAllTemplateConfigs, getTemplateConfig } from '../models/Template';
import { DEFAULT_COLORS } from '../constants';

export interface ProjectSetupResult {
  name: string;
  filePath: string;
  type: TemplateType;
  color: string;
  target?: number;
  unit?: string;
  emoji?: string;
}

export class ProjectSetupModal extends Modal {
  private result: ProjectSetupResult | null = null;
  private resolvePromise!: (value: ProjectSetupResult | null) => void;

  constructor(app: App) {
    super(app);
  }

  open(): Promise<ProjectSetupResult | null> {
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      super.open();
    });
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass('square-project-setup-modal');

    contentEl.innerHTML = `
      <h2>新建打卡项目</h2>
      <div class="square-entry-form">
        <div class="square-entry-row">
          <label>项目名称</label>
          <input class="square-entry-input" id="setup-name" placeholder="例如：阅读" />
        </div>
        <div class="square-entry-row">
          <label>Emoji（可选）</label>
          <input class="square-entry-input" id="setup-emoji" placeholder="📖" maxlength="2" />
        </div>
        <div class="square-entry-row">
          <label>模板类型</label>
          <select id="setup-type" class="square-entry-input">
            ${getAllTemplateConfigs().map(t =>
              `<option value="${t.type}">${t.label} — ${t.description}</option>`
            ).join('')}
          </select>
        </div>
        <div class="square-entry-row" id="setup-target-row" style="display:none">
          <label>目标值</label>
          <input class="square-entry-input" id="setup-target" type="number" min="0" placeholder="30" />
        </div>
        <div class="square-entry-row" id="setup-unit-row" style="display:none">
          <label>单位</label>
          <input class="square-entry-input" id="setup-unit" placeholder="分钟 / 页 / 杯" />
        </div>
        <div class="square-entry-row">
          <label>颜色</label>
          <div class="square-color-picker">
            ${DEFAULT_COLORS.map(c =>
              `<div class="square-color-swatch" style="background:${c}" data-color="${c}"></div>`
            ).join('')}
          </div>
        </div>
      </div>
      <div class="square-entry-actions">
        <button class="square-entry-button is-secondary" data-action="cancel">取消</button>
        <button class="square-entry-button" data-action="create">创建</button>
      </div>
    `;

    // Type switch show/hide target/unit
    const typeSelect = contentEl.querySelector('#setup-type') as HTMLSelectElement;
    const targetRow = contentEl.querySelector('#setup-target-row') as HTMLElement;
    const unitRow = contentEl.querySelector('#setup-unit-row') as HTMLElement;

    typeSelect.addEventListener('change', () => {
      const config = getTemplateConfig(typeSelect.value as TemplateType);
      targetRow.style.display = (config.hasTarget || config.hasValue) ? '' : 'none';
      unitRow.style.display = config.hasUnit ? '' : 'none';
    });
    typeSelect.dispatchEvent(new Event('change'));

    // Color picker
    let selectedColor = DEFAULT_COLORS[0];
    contentEl.querySelectorAll('.square-color-swatch').forEach(el => {
      el.addEventListener('click', () => {
        contentEl.querySelectorAll('.square-color-swatch').forEach(e => e.removeClass('is-selected'));
        el.addClass('is-selected');
        selectedColor = (el as HTMLElement).dataset.color!;
      });
    });

    // Actions
    contentEl.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.result = null;
      this.close();
    });

    contentEl.querySelector('[data-action="create"]')?.addEventListener('click', async () => {
      const name = (contentEl.querySelector('#setup-name') as HTMLInputElement).value.trim();
      if (!name) return;
      // Prevent path traversal
      if (name.includes('/') || name.includes('\\') || name.includes('..')) return;

      this.result = {
        name,
        filePath: `${name}.md`,
        type: typeSelect.value as TemplateType,
        color: selectedColor,
        target: parseInt((contentEl.querySelector('#setup-target') as HTMLInputElement).value) || undefined,
        unit: (contentEl.querySelector('#setup-unit') as HTMLInputElement).value.trim() || undefined,
        emoji: (contentEl.querySelector('#setup-emoji') as HTMLInputElement).value.trim() || undefined,
      };
      this.close();
    });
  }

  onClose(): void {
    this.resolvePromise(this.result);
    this.contentEl.empty();
  }
}

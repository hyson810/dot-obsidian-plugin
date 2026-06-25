import { Modal, App } from 'obsidian';
import type { Project, TrackRecord } from '../types';
import { formatDate } from '../utils/date';
import { getTemplateConfig } from '../models/Template';

export class EntryModal extends Modal {
  private result: TrackRecord | null = null;
  private resolvePromise!: (value: TrackRecord | null) => void;

  constructor(
    app: App,
    private project: Project,
    private date: string = formatDate(new Date())
  ) {
    super(app);
  }

  open(): Promise<TrackRecord | null> {
    return new Promise(resolve => {
      this.resolvePromise = resolve;
      super.open();
    });
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass('square-entry-modal');
    const config = getTemplateConfig(this.project.type);

    contentEl.innerHTML = `
      <div class="square-entry-modal-content">
        <div class="square-entry-header">
          ${this.project.emoji || ''} ${this.project.name}
        </div>
        <div class="square-entry-form">
          <div class="square-entry-row square-entry-row--date">
            <input type="date" class="square-entry-date-input" value="${this.date}" />
          </div>
          ${config.hasValue ? `
          <div class="square-entry-row square-entry-row--count">
            <div class="square-entry-count-row">
              <button class="square-entry-count-step">−</button>
              <input type="number" class="square-entry-count-input" value="${this.project.target || 0}" min="0" />
              <button class="square-entry-count-step">+</button>
            </div>
            ${this.project.unit ? `<span class="square-entry-unit">${this.project.unit}</span>` : ''}
          </div>` : ''}
          ${config.hasNote ? `
          <div class="square-entry-row square-entry-row--note">
            <textarea class="square-entry-note-input" placeholder="记录一下..." rows="3"></textarea>
          </div>` : ''}
        </div>
        <div class="square-entry-actions">
          <button class="square-entry-button is-secondary" data-action="cancel">取消</button>
          <button class="square-entry-button" data-action="save">保存</button>
        </div>
      </div>
    `;

    const dateInput = contentEl.querySelector('.square-entry-date-input') as HTMLInputElement;
    const countInput = contentEl.querySelector('.square-entry-count-input') as HTMLInputElement;
    const noteInput = contentEl.querySelector('.square-entry-note-input') as HTMLTextAreaElement;
    const stepBtns = contentEl.querySelectorAll('.square-entry-count-step');

    // Step buttons
    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!countInput) return;
        const delta = btn.textContent === '+' ? 1 : -1;
        countInput.value = String(Math.max(0, parseInt(countInput.value || '0') + delta));
      });
    });

    // Action buttons
    contentEl.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
      this.result = null;
      this.close();
    });

    contentEl.querySelector('[data-action="save"]')?.addEventListener('click', () => {
      this.result = {
        date: dateInput?.value || this.date,
        completed: true,
        value: countInput ? parseInt(countInput.value) || undefined : undefined,
        note: noteInput?.value || undefined,
      };
      this.close();
    });
  }

  onClose(): void {
    this.resolvePromise(this.result);
    this.contentEl.empty();
  }
}

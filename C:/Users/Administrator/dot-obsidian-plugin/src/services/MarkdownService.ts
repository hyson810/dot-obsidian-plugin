import { Vault, TFile } from 'obsidian';
import type { Project, TrackRecord, DayData } from '../types';
import { parseRecordsFromMarkdown } from '../models/Record';
import { parseConfigFromMarkdown, serializeConfigToMarkdown } from '../models/Project';

export class MarkdownService {
  constructor(private vault: Vault) {}

  async readFileContent(filePath: string): Promise<string> {
    const file = this.vault.getFileByPath(filePath);
    if (!file) throw new Error(`File not found: ${filePath}`);
    return await this.vault.read(file);
  }

  async getProjectConfig(filePath: string): Promise<Partial<Project> | null> {
    try {
      const content = await this.readFileContent(filePath);
      return parseConfigFromMarkdown(content);
    } catch {
      return null;
    }
  }

  async getRecords(
    filePath: string,
    startDate?: string,
    endDate?: string
  ): Promise<DayData[]> {
    const content = await this.readFileContent(filePath);
    const allDays = parseRecordsFromMarkdown(content);

    if (!startDate && !endDate) return allDays;

    return allDays.filter(d => {
      if (startDate && d.date < startDate) return false;
      if (endDate && d.date > endDate) return false;
      return true;
    });
  }

  async appendRecord(filePath: string, date: string, record: TrackRecord): Promise<void> {
    const file = this.vault.getFileByPath(filePath);
    if (!file) throw new Error(`File not found: ${filePath}`);

    const content = await this.vault.read(file);
    const recordLines: string[] = [];
    const check = record.completed ? 'x' : ' ';
    const valueStr = record.value !== undefined ? ` ${record.value}` : '';
    recordLines.push(`- [${check}] 打卡${valueStr}`);
    if (record.note) {
      recordLines.push(`  ${record.note}`);
    }

    const dateHeader = `## ${date}`;
    if (content.includes(dateHeader)) {
      // Append after the date header
      const lines = content.split('\n');
      const dateIdx = lines.findIndex(l => l.trim() === dateHeader);
      lines.splice(dateIdx + 1, 0, ...recordLines);
      await this.vault.modify(file, lines.join('\n'));
    } else {
      // Add new date section before ## 配置 (or at end)
      const configIdx = content.indexOf('\n## 配置');
      if (configIdx >= 0) {
        const before = content.substring(0, configIdx);
        const after = content.substring(configIdx);
        const newSection = `\n${dateHeader}\n${recordLines.join('\n')}\n`;
        await this.vault.modify(file, before + newSection + after);
      } else {
        await this.vault.append(file, `\n${dateHeader}\n${recordLines.join('\n')}\n`);
      }
    }
  }

  async writeConfig(filePath: string, project: Project): Promise<void> {
    const file = this.vault.getFileByPath(filePath);
    if (!file) throw new Error(`File not found: ${filePath}`);
    const content = await this.vault.read(file);

    const configStr = serializeConfigToMarkdown(project);

    if (content.includes('## 配置')) {
      const replaced = content.replace(/## 配置\n[\s\S]*?(?=\n## |\n$|$)/, configStr);
      await this.vault.modify(file, replaced);
    } else {
      await this.vault.append(file, `\n${configStr}`);
    }
  }

  async ensureFile(filePath: string, title: string): Promise<TFile> {
    const existing = this.vault.getFileByPath(filePath);
    if (existing) return existing;

    return await this.vault.create(filePath, `# ${title}\n\n`);
  }
}

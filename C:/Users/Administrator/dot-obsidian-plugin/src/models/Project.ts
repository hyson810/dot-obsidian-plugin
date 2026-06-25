import type { Project, TemplateType } from '../types';
import { SQUARE_CONFIG_PREFIX } from '../constants';

let projectCounter = 0;

export function generateProjectId(): string {
  return `dot-${Date.now()}-${++projectCounter}`;
}

export function createProject(
  name: string,
  filePath: string,
  type: TemplateType,
  color: string,
  target?: number,
  unit?: string,
  emoji?: string
): Project {
  return {
    id: generateProjectId(),
    name,
    filePath,
    type,
    target,
    unit,
    color,
    archived: false,
    sortOrder: 0,
    emoji,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function parseConfigFromMarkdown(content: string): Partial<Project> | null {
  const configSection = content.match(/## 配置\n([\s\S]*?)(?=\n## |\n$|$)/);
  if (!configSection) return null;

  const config: Record<string, string> = {};
  for (const line of configSection[1].split('\n')) {
    const match = line.match(/^([\w-]+):\s*(.+)/);
    if (match) {
      config[match[1].trim()] = match[2].trim();
    }
  }

  const project: Partial<Project> = {};
  if (config[`${SQUARE_CONFIG_PREFIX}id`]) project.id = config[`${SQUARE_CONFIG_PREFIX}id`];
  if (config[`${SQUARE_CONFIG_PREFIX}type`]) project.type = config[`${SQUARE_CONFIG_PREFIX}type`] as TemplateType;
  if (config[`${SQUARE_CONFIG_PREFIX}target`]) project.target = Number(config[`${SQUARE_CONFIG_PREFIX}target`]);
  if (config[`${SQUARE_CONFIG_PREFIX}unit`]) project.unit = config[`${SQUARE_CONFIG_PREFIX}unit`];
  if (config[`${SQUARE_CONFIG_PREFIX}color`]) project.color = config[`${SQUARE_CONFIG_PREFIX}color`];
  if (config[`${SQUARE_CONFIG_PREFIX}archived`]) project.archived = config[`${SQUARE_CONFIG_PREFIX}archived`] === 'true';

  return Object.keys(project).length > 0 ? project : null;
}

export function serializeConfigToMarkdown(project: Project): string {
  const lines = [
    '## 配置',
    `${SQUARE_CONFIG_PREFIX}id: ${project.id}`,
    `${SQUARE_CONFIG_PREFIX}type: ${project.type}`,
  ];
  if (project.target !== undefined) lines.push(`${SQUARE_CONFIG_PREFIX}target: ${project.target}`);
  if (project.unit) lines.push(`${SQUARE_CONFIG_PREFIX}unit: ${project.unit}`);
  if (project.color) lines.push(`${SQUARE_CONFIG_PREFIX}color: ${project.color}`);
  if (project.archived) lines.push(`${SQUARE_CONFIG_PREFIX}archived: true`);
  lines.push('');
  return lines.join('\n');
}

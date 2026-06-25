import type { TemplateType, TemplateConfig } from '../types';
import { TEMPLATES } from '../constants';

export function getTemplateConfig(type: TemplateType): TemplateConfig {
  return TEMPLATES[type];
}

export function getAllTemplateConfigs(): TemplateConfig[] {
  return Object.values(TEMPLATES);
}

export function isTemplateValid(type: string): type is TemplateType {
  return type in TEMPLATES;
}

export function getTemplateLabel(type: TemplateType): string {
  return TEMPLATES[type].label;
}

export function templateSupportsValue(type: TemplateType): boolean {
  return TEMPLATES[type].hasValue;
}

export function templateSupportsTarget(type: TemplateType): boolean {
  return TEMPLATES[type].hasTarget;
}

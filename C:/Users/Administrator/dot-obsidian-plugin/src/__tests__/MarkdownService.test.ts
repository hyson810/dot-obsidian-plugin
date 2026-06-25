import { describe, it, expect } from 'vitest';
import { parseRecordsFromMarkdown } from '../models/Record';
import { parseConfigFromMarkdown } from '../models/Project';

// NOTE: These tests validate the markdown parsing logic in isolation.
// The MarkdownService class wraps Obsidian Vault API - we test the parsing directly.

describe('Markdown Parsing', () => {
  const sampleContent = `# 阅读

## 2026-06-26
- [x] 打卡 30
  今天读得很投入

## 2026-06-25
- [ ] 打卡
  没读

## 配置
square-id: reading
square-type: count
square-target: 30
square-unit: 分钟
square-color: #4CAF50
square-archived: false
`;

  it('should parse records from markdown', () => {
    const days = parseRecordsFromMarkdown(sampleContent);
    expect(days).toHaveLength(2);
    expect(days[0].date).toBe('2026-06-26');
    expect(days[0].records[0].completed).toBe(true);
    expect(days[0].records[0].value).toBe(30);
    expect(days[1].records[0].note).toBe('没读');
  });

  it('should parse config from markdown', () => {
    const config = parseConfigFromMarkdown(sampleContent);
    expect(config).not.toBeNull();
    expect(config?.id).toBe('reading');
    expect(config?.type).toBe('count');
    expect(config?.color).toBe('#4CAF50');
  });
});

import type { TrackRecord, DayData } from '../types';

export function parseRecordsFromMarkdown(content: string): DayData[] {
  const days: DayData[] = [];
  const dateRegex = /^## (\d{4}-\d{2}-\d{2})/;
  const recordRegex = /^- \[([ x])\] 打卡(?:\s+([\d.]+))?/;
  const noteRegex = /^  (.+)/;

  const lines = content.split('\n');
  let currentDay: DayData | null = null;

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (dateMatch) {
      if (currentDay) days.push(currentDay);
      currentDay = { date: dateMatch[1], records: [] };
      continue;
    }

    const recordMatch = line.match(recordRegex);
    if (recordMatch && currentDay) {
      currentDay.records.push({
        date: currentDay.date,
        completed: recordMatch[1] === 'x',
        value: recordMatch[2] ? Number(recordMatch[2]) : undefined,
      });
      continue;
    }

    const noteMatch = line.match(noteRegex);
    if (noteMatch && currentDay && currentDay.records.length > 0) {
      currentDay.records[currentDay.records.length - 1].note = noteMatch[1].trim();
    }
  }

  if (currentDay) days.push(currentDay);
  return days;
}

export function serializeRecordToMarkdown(date: string, record: TrackRecord): string[] {
  const lines: string[] = [];
  lines.push(`## ${date}`);
  const check = record.completed ? 'x' : ' ';
  const valueStr = record.value !== undefined ? ` ${record.value}` : '';
  lines.push(`- [${check}] 打卡${valueStr}`);
  if (record.note) {
    lines.push(`  ${record.note}`);
  }
  lines.push('');
  return lines;
}

export function getRecordsForDate(days: DayData[], date: string): TrackRecord[] {
  const day = days.find(d => d.date === date);
  return day?.records ?? [];
}

export function calculateCompletionRate(days: DayData[], totalDays: number): number {
  if (totalDays === 0) return 0;
  const completed = days.filter(d => d.records.some(r => r.completed)).length;
  return completed / totalDays;
}

export function calculateTotalValue(days: DayData[]): number {
  return days.reduce((sum, day) => {
    return sum + day.records.reduce((s, r) => s + (r.value ?? 0), 0);
  }, 0);
}

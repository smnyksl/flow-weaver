import { JournalEntry } from '@/types/journal';
import { Achievement, UserStats } from '@/types/rewards';

export type ExportFormat = 'json' | 'csv';

interface ExportData {
  entries: JournalEntry[];
  achievements: Achievement[];
  stats: UserStats;
  exportedAt: string;
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(entries: JournalEntry[]): string {
  const headers = ['Tarih', 'İçerik', 'Duygu', 'Yoğunluk', 'Tetikleyiciler'];
  
  const rows = entries.map(entry => [
    new Date(entry.createdAt).toLocaleString('tr-TR'),
    `"${entry.content.replace(/"/g, '""')}"`,
    entry.emotion.primaryEmotion,
    entry.emotion.intensity.toString(),
    `"${entry.emotion.triggers.join(', ')}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportUserData(
  entries: JournalEntry[],
  achievements: Achievement[],
  stats: UserStats,
  format: ExportFormat
) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'json') {
    const data: ExportData = {
      entries,
      achievements: achievements.filter(a => a.unlockedAt),
      stats,
      exportedAt: new Date().toISOString()
    };
    const content = exportToJSON(data);
    downloadFile(content, `duygu-gunlugu-${timestamp}.json`, 'application/json');
  } else {
    const content = exportToCSV(entries);
    downloadFile(content, `duygu-gunlugu-${timestamp}.csv`, 'text/csv;charset=utf-8');
  }
}

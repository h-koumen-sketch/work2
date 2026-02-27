// 日付文字列（例: 2026-02-18T14:49:52）を「2026-02-18 14:49:52」形式に変換
export function formatDateTime(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace('T', ' ');
}

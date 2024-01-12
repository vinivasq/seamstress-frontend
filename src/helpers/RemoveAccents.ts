export function RemoveAccents(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

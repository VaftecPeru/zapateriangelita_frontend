// Relations are nullable in imported/legacy products; typeof null is 'object'.
export function getCatalogName(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
    return value.name.trim();
  }
  return '';
}

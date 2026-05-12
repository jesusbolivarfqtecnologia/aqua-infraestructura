export function formatAbscisa(val: number): string {
  if (!Number.isFinite(val)) return '-';
  const km = Math.floor(val / 1000);
  const rest = Math.round(val % 1000);
  const restStr = String(rest).padStart(3, '0');
  return `K${km}+${restStr}`;
}

export function formatFecha(iso: string): string {
  if (!iso) return '';
  const date = iso.split('T')[0];
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function extractYear(fecha: string): string {
  if (!fecha) return '';
  return fecha.slice(0, 4);
}

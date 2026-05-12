import type { DatosIRI, IRI_RegistroBase } from '@/types';

export function getNiceMax(val: number): number {
  if (!Number.isFinite(val) || val <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(val)));
  const normalized = val / magnitude;
  let nice = 1;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

export function buildChartData100m(
  mediciones: Array<{ id: string; datos: DatosIRI }>,
  selectedIds: string[]
): Array<{ abscisa: number } & Record<string, number | undefined>> {
  const activeIds = selectedIds.length ? new Set(selectedIds) : new Set(mediciones.map((m) => m.id));
  const map = new Map<number, { abscisa: number } & Record<string, number | undefined>>();

  mediciones.forEach((m) => {
    if (!activeIds.has(m.id)) return;
    m.datos.registros_puntual.forEach((r) => {
      const key = r.from_m;
      if (!map.has(key)) map.set(key, { abscisa: key });
      const row = map.get(key)!;
      row[m.id] = r.valor;
    });
  });

  return Array.from(map.values()).sort((a, b) => a.abscisa - b.abscisa);
}

export function buildChartData20m(
  baseDataMap: Record<string, IRI_RegistroBase[]>,
  selectedIds: string[]
): Array<{ abscisa: number } & Record<string, number | undefined>> {
  const ids = selectedIds.length ? selectedIds : Object.keys(baseDataMap);
  const map = new Map<number, { abscisa: number } & Record<string, number | undefined>>();

  ids.forEach((id) => {
    const records = baseDataMap[id] || [];
    records.forEach((r) => {
      const key = r.from_m;
      if (!map.has(key)) map.set(key, { abscisa: key });
      const row = map.get(key)!;
      row[`${id}_izq`] = r.iri_izq;
      row[`${id}_der`] = r.iri_der;
    });
  });

  return Array.from(map.values()).sort((a, b) => a.abscisa - b.abscisa);
}

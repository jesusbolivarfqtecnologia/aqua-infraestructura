import type {
  DatosIRI,
  IRI_RegistroBase,
  IRI_RegistroPuntual,
  IRI_ResumenKm,
  IRI_Estadisticas,
} from '@/types';

function parseDistancia(str: string): number {
  if (!str) return NaN;
  const clean = str.trim().replace(/"/g, '');
  const prMatch = clean.toUpperCase().match(/PR(\d+)\+(\d+)/);
  if (prMatch) return parseInt(prMatch[1], 10) * 1000 + parseInt(prMatch[2], 10);
  const kMatch = clean.toUpperCase().match(/K(\d+)\+(\d+)/);
  if (kMatch) return parseInt(kMatch[1], 10) * 1000 + parseInt(kMatch[2], 10);
  return parseFloat(clean.replace(/,/g, '.'));
}

function parseNum(str: string): number {
  if (!str) return NaN;
  return parseFloat(str.trim().replace(/"/g, '').replace(/,/g, '.'));
}

function splitCSV(line: string): string[] {
  const result: string[] = [];
  let inQuote = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuote = !inQuote; current += c; continue; }
    if (!inQuote && (c === ',' || c === ';' || c === '\t')) { result.push(current); current = ''; continue; }
    current += c;
  }
  if (current.length > 0) result.push(current);
  return result.map(s => s.trim());
}

export function agruparPorKm(
  records: IRI_RegistroPuntual[],
  condPuntual: number,
  condMedio: number
): { stats: IRI_Estadisticas | null; km: IRI_ResumenKm[] } {
  if (!records || records.length === 0) return { stats: null, km: [] };

  let maxPuntual = -Infinity;
  let minPuntual = Infinity;
  let fallosGlobales = 0;
  let sumMediaGlobal = 0;
  let kmFallidos = 0;
  const combinedKm: IRI_ResumenKm[] = [];

  const sorted = [...records].sort((a, b) => a.from_m - b.from_m);
  let currentKmStart = sorted[0].from_m;
  let currentKmEnd = currentKmStart + 1000;
  let currentKmRecords: IRI_RegistroPuntual[] = [];

  const processKm = () => {
    if (currentKmRecords.length === 0) return;
    const n = currentKmRecords.length;
    const valor_medio = currentKmRecords.reduce((s, r) => s + r.valor, 0) / n;
    const n_incumplimientos = currentKmRecords.filter(r => !r.cumple_puntual).length;
    const cumple_medio = valor_medio <= condMedio;
    const cumple_km = cumple_medio && n_incumplimientos === 0;
    const km_label = `KM ${Math.floor(currentKmStart / 1000)}`;
    combinedKm.push({
      km_label,
      from_m: currentKmStart,
      to_m: currentKmEnd,
      valor_medio,
      n_puntuales: n,
      n_incumplimientos,
      cumple_medio,
      cumple_km,
    });

    // stats
    sumMediaGlobal += valor_medio;
    if (!cumple_km) kmFallidos++;
    fallosGlobales += n_incumplimientos;
    currentKmRecords = [];
  };

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    while (r.from_m >= currentKmEnd) {
      processKm();
      currentKmStart = currentKmEnd;
      currentKmEnd = currentKmStart + 1000;
    }
    currentKmRecords.push(r);
    if (r.valor > maxPuntual) maxPuntual = r.valor;
    if (r.valor < minPuntual) minPuntual = r.valor;
    if (!r.cumple_puntual) fallosGlobales = fallosGlobales; // counted later per km
  }
  processKm();

  const stats: IRI_Estadisticas = {
    total_registros_base: records.length,
    total_puntuales: records.length,
    valor_medio_global: combinedKm.length ? sumMediaGlobal / combinedKm.length : 0,
    valor_max_puntual: maxPuntual === -Infinity ? 0 : maxPuntual,
    valor_min_puntual: minPuntual === Infinity ? 0 : minPuntual,
    n_incumplimientos_puntual: fallosGlobales,
    n_km_incumplen: kmFallidos,
    porcentaje_cumplimiento: records.length ? ((records.length - fallosGlobales) / records.length) * 100 : 0,
    cumple_global: kmFallidos === 0,
  };

  return { stats, km: combinedKm };
}

export function parsearArchivoIRI(
  csvText: string,
  condicionPuntual: number,
  condicionMedio: number
): { datos: DatosIRI; registrosBase: IRI_RegistroBase[] } {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 1) throw new Error('Archivo vacío o sin datos.');

  let dataStartIndex = 0;
  let intervalo_base_m = 20;

  // intentar detectar intervalo base en primeras 10 filas
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const cols = splitCSV(lines[i]);
    if (cols.length >= 5) {
      const maybeInterval = parseNum(cols[2]);
      if (!isNaN(maybeInterval) && maybeInterval > 0 && maybeInterval <= 1000) {
        intervalo_base_m = Math.round(maybeInterval);
      }
      // considerar primera fila de datos si contiene números
      const a = parseDistancia(cols[0]);
      const b = parseDistancia(cols[1]);
      if (!isNaN(a) && !isNaN(b)) { dataStartIndex = i; break; }
    }
  }

  const registros_base: IRI_RegistroBase[] = [];
  for (let i = dataStartIndex; i < lines.length; i++) {
    const cols = splitCSV(lines[i]);
    if (cols.length < 5) continue;
    const from_m = parseDistancia(cols[0]);
    const to_m = parseDistancia(cols[1]);
    const iri_izq = parseNum(cols[3]);
    const iri_der = parseNum(cols[4]);
    if (isNaN(from_m) || isNaN(to_m) || isNaN(iri_izq) || isNaN(iri_der)) continue;
    const promedio = (iri_izq + iri_der) / 2;
    registros_base.push({ from_m, to_m, iri_izq, iri_der, promedio });
  }

  if (registros_base.length === 0) throw new Error('No se encontraron datos válidos.');

  // Agrupar en puntuales de 100m
  const pointsPer100m = Math.max(1, Math.round(100 / intervalo_base_m));
  const registros_puntual: IRI_RegistroPuntual[] = [];
  for (let i = 0; i < registros_base.length; i += pointsPer100m) {
    const chunk = registros_base.slice(i, i + pointsPer100m);
    if (chunk.length === 0) continue;
    const valor = chunk.reduce((s, r) => s + r.promedio, 0) / chunk.length;
    registros_puntual.push({ from_m: chunk[0].from_m, to_m: chunk[chunk.length - 1].to_m, valor, cumple_puntual: valor <= condicionPuntual });
  }

  const { stats, km } = agruparPorKm(registros_puntual, condicionPuntual, condicionMedio);

  const datos: DatosIRI = {
    tipo: 'IRI',
    version: '1.0',
    unidad: 'm/km',
    intervalo_base_m,
    intervalo_puntual_m: 100,
    registros_puntual,
    resumen_km: km,
    estadisticas: stats || {
      total_registros_base: registros_base.length,
      total_puntuales: registros_puntual.length,
      valor_medio_global: 0,
      valor_max_puntual: 0,
      valor_min_puntual: 0,
      n_incumplimientos_puntual: 0,
      n_km_incumplen: 0,
      porcentaje_cumplimiento: 0,
      cumple_global: true,
    },
  };

  return { datos, registrosBase: registros_base };
}

export default { parsearArchivoIRI, agruparPorKm };

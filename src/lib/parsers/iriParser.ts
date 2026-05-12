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

function splitCSV(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let inQuote = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuote = !inQuote; current += c; continue; }
    if (!inQuote && c === delimiter) { result.push(current); current = ''; continue; }
    current += c;
  }
  if (current.length > 0) result.push(current);
  return result.map(s => s.trim());
}

function detectDelimiter(line: string): string {
  if (line.includes('|')) return '|';
  if (line.includes(';')) return ';';
  if (line.includes('\t')) return '\t';
  return ',';
}

function validarHeader(line: string, delimiter: string): void {
  if (delimiter === ',') {
    const headerRegex = /^\s*"?from\s*\(m\)"?\s*,\s*"?to\s*\(m\)"?\s*,\s*"?distance\s*\(m\)"?\s*,\s*"?iri,\s*left\s*\(mm\/m\)"?\s*,\s*"?iri,\s*right\s*\(mm\/m\)"?\s*$/i;
    if (headerRegex.test(line)) return;
  }

  const cols = splitCSV(line, delimiter);
  if (cols.length !== 5) {
    throw new Error('El archivo debe tener exactamente 5 columnas.');
  }

  const normalized = cols.map((c) => c.toLowerCase().replace(/\s+/g, ' ').trim());
  const checks = [
    normalized[0].includes('from'),
    normalized[1].includes('to'),
    normalized[2].includes('distance'),
    normalized[3].includes('iri') && normalized[3].includes('left'),
    normalized[4].includes('iri') && normalized[4].includes('right'),
  ];

  if (checks.some((ok) => !ok)) {
    throw new Error('Encabezado invalido. Usa: "From (m), To (m), Distance (m), IRI, Left (mm/m), IRI, Right (mm/m)".');
  }
}

export function agruparPorKm(
  records: Array<IRI_RegistroPuntual | IRI_RegistroBase>,
  isCrudo: boolean,
  condPuntual: number,
  condMedio: number
): { stats: IRI_Estadisticas | null; km: IRI_ResumenKm[] } {
  if (!records || records.length === 0) return { stats: null, km: [] };

  let maxPuntual = -Infinity;
  let fallosGlobales = 0;
  let sumMediaGlobal = 0;
  let kmFallidos = 0;
  const combinedKm: IRI_ResumenKm[] = [];

  const sorted = [...records].sort((a, b) => a.from_m - b.from_m);
  let currentKmStart = sorted[0].from_m;
  let currentKmEnd = currentKmStart + 1000;
  let currentKmRecords: Array<IRI_RegistroPuntual | IRI_RegistroBase> = [];

  const processKm = () => {
    if (currentKmRecords.length === 0) return;
    let fallosKm = 0;
    let sumKm = 0;

    currentKmRecords.forEach((r) => {
      let val = 0;
      let isFallo = false;
      if (isCrudo) {
        const rr = r as IRI_RegistroBase;
        val = Math.max(rr.iri_izq, rr.iri_der);
        isFallo = rr.iri_izq > condPuntual || rr.iri_der > condPuntual;
        sumKm += rr.promedio;
      } else {
        const rp = r as IRI_RegistroPuntual;
        val = rp.valor;
        isFallo = rp.valor > condPuntual;
        sumKm += rp.valor;
      }
      if (val > maxPuntual) maxPuntual = val;
      if (isFallo) fallosKm++;
    });

    const valor_medio = sumKm / currentKmRecords.length;
    const cumple_medio = valor_medio <= condMedio;
    const cumple_km = cumple_medio && fallosKm === 0;

    fallosGlobales += fallosKm;
    sumMediaGlobal += valor_medio;
    if (!cumple_km) kmFallidos++;

    const kf = Math.floor(currentKmStart / 1000);
    const rf = String(Math.round(currentKmStart % 1000)).padStart(3, '0');
    const kt = Math.floor(currentKmEnd / 1000);
    const rt = String(Math.round(currentKmEnd % 1000)).padStart(3, '0');

    combinedKm.push({
      km_label: `K${kf}+${rf} - K${kt}+${rt}`,
      from_m: currentKmStart,
      to_m: currentKmEnd,
      valor_medio,
      n_puntuales: currentKmRecords.length,
      n_incumplimientos: fallosKm,
      cumple_medio,
      cumple_km,
    });
  };

  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    while (r.from_m >= currentKmEnd) {
      processKm();
      currentKmStart = currentKmEnd;
      currentKmEnd += 1000;
      currentKmRecords = [];
    }
    currentKmRecords.push(r);
  }
  processKm();

  const stats: IRI_Estadisticas = {
    total_registros_base: records.length,
    total_puntuales: records.length,
    valor_medio_global: combinedKm.length ? sumMediaGlobal / combinedKm.length : 0,
    valor_max_puntual: maxPuntual === -Infinity ? 0 : maxPuntual,
    valor_min_puntual: 0,
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

  const delimiter = detectDelimiter(lines[0]);
  validarHeader(lines[0], delimiter);

  let dataStartIndex = 1;
  let intervalo_base_m = 20;

  // intentar detectar intervalo base en primeras 10 filas
  for (let i = dataStartIndex; i < Math.min(dataStartIndex + 10, lines.length); i++) {
    const cols = splitCSV(lines[i], delimiter);
    if (cols.length >= 5) {
      const maybeInterval = parseNum(cols[2]);
      if (!isNaN(maybeInterval) && maybeInterval > 0 && maybeInterval <= 1000) {
        intervalo_base_m = Math.round(maybeInterval);
      }
    }
  }

  const registros_base: IRI_RegistroBase[] = [];
  for (let i = dataStartIndex; i < lines.length; i++) {
    const cols = splitCSV(lines[i], delimiter);
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

  const { stats, km } = agruparPorKm(registros_puntual, false, condicionPuntual, condicionMedio);
  if (stats) {
    stats.total_registros_base = registros_base.length;
    stats.total_puntuales = registros_puntual.length;
  }

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

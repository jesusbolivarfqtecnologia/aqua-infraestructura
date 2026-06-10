'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import type {
  Indicador,
  IRI_RegistroBase,
  IRI_ResumenKm,
  Medicion,
  Proyecto,
  RegistrosBasePayload,
  Ruta,
  UnidadFuncional,
} from '@/types';
import { AppShell } from '@/components/layout';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { EstadisticasCards, GraficaBarrasKm, GraficaIRI, TablaResumenKm } from '@/components/mediciones';
import { agruparPorKm } from '@/lib/parsers/iriParser';
import { buildChartData100m, buildChartData20m, getNiceMax } from '@/lib/utils/chartHelpers';
import { COLOR_PAIRS } from '@/lib/utils/colorPairs';
import { extractYear, formatAbscisa, formatFecha } from '@/lib/utils/formatters';

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/,+/g, '')
    .replace(/[^a-z0-9_]/g, '');

const headerIndex = (headers: string[], key: string) => {
  const normalizedHeaders = headers.map(normalizeHeader);
  return normalizedHeaders.indexOf(normalizeHeader(key));
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
};

const buildIriRecord = (
  from_m: number,
  to_m: number,
  iri_izq: number,
  iri_der: number,
  promedio: number
): IRI_RegistroBase | null => {
  if (!Number.isFinite(from_m) || !Number.isFinite(to_m) || !Number.isFinite(iri_izq) || !Number.isFinite(iri_der)) return null;
  const avg = Number.isFinite(promedio) ? promedio : (iri_izq + iri_der) / 2;
  return { from_m, to_m, iri_izq, iri_der, promedio: avg };
};

const parseRegistrosBase = (payload: unknown): IRI_RegistroBase[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as IRI_RegistroBase[];

  const typed = payload as RegistrosBasePayload;
  const headers = Array.isArray(typed.headers) ? typed.headers.map((h) => String(h)) : [];
  const data = Array.isArray(typed.data) ? typed.data : [];
  if (!headers.length || !data.length) return [];

  const idxFrom = headerIndex(headers, 'from_m');
  const idxTo = headerIndex(headers, 'to_m');
  const idxIzq = headerIndex(headers, 'iri_izq');
  const idxDer = headerIndex(headers, 'iri_der');
  const idxProm = headerIndex(headers, 'promedio');
  if (idxFrom < 0 || idxTo < 0 || idxIzq < 0 || idxDer < 0) return [];

  return data
    .map((row) => {
      if (Array.isArray(row)) {
        return buildIriRecord(
          toNumber(row[idxFrom]),
          toNumber(row[idxTo]),
          toNumber(row[idxIzq]),
          toNumber(row[idxDer]),
          idxProm >= 0 ? toNumber(row[idxProm]) : NaN
        );
      }

      if (row && typeof row === 'object') {
        const record = row as Record<string, unknown>;
        return buildIriRecord(
          toNumber(record.from_m),
          toNumber(record.to_m),
          toNumber(record.iri_izq),
          toNumber(record.iri_der),
          toNumber(record.promedio)
        );
      }

      return null;
    })
    .filter((r): r is IRI_RegistroBase => !!r);
};

export default function MedicionDetallePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [medicion, setMedicion] = useState<Medicion | null>(null);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [uf, setUf] = useState<UnidadFuncional | null>(null);
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [indicador, setIndicador] = useState<Indicador | null>(null);
  const [medicionesRelacionadas, setMedicionesRelacionadas] = useState<Medicion[]>([]);
  const [registrosBaseMap, setRegistrosBaseMap] = useState<Record<string, IRI_RegistroBase[]>>({});
  const [selectedMedIds, setSelectedMedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'100m' | '20m'>('100m');
  const [brushIndexes, setBrushIndexes] = useState<{ startIndex: number; endIndex: number } | null>(null);
  const [fullscreenChart, setFullscreenChart] = useState<'line' | 'bar' | null>(null);
  const [isLoadingBase, setIsLoadingBase] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/mediciones/${id}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error.message || 'Error al cargar medicion');

        const med = json.data?.medicion as Medicion;
        const registros = parseRegistrosBase(json.data?.registros_base);

        setMedicion(med);
        setRegistrosBaseMap({ [id]: registros });
        setSelectedMedIds([id]);

        const [projRes, ufRes, rutaRes, indRes, listRes] = await Promise.all([
          fetch(`/api/proyectos/${med.proyecto_id}`),
          fetch(`/api/unidades-funcionales/${med.unidad_funcional_id}`),
          fetch(`/api/rutas/${med.ruta_id}`),
          fetch(`/api/indicadores/${med.indicador_id}`),
          fetch('/api/mediciones'),
        ]);

        const projJson = await projRes.json();
        const ufJson = await ufRes.json();
        const rutaJson = await rutaRes.json();
        const indJson = await indRes.json();
        const listJson = await listRes.json();

        if (projJson.data) setProyecto(projJson.data);
        if (ufJson.data) setUf(ufJson.data);
        if (rutaJson.data) setRuta(rutaJson.data);
        if (indJson.data) setIndicador(indJson.data);

        const list: Medicion[] = listJson.data || [];
        const carril = med.carriles_seleccionados[0];
        const related = list.filter(
          (m) => m.ruta_id === med.ruta_id && m.indicador_id === med.indicador_id && m.carriles_seleccionados.includes(carril)
        );
        setMedicionesRelacionadas(related.length > 0 ? related : [med]);
      } catch (e: any) {
        setError(e.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (viewMode !== '20m' || selectedMedIds.length === 0) return;
    const missing = selectedMedIds.filter((mid) => !registrosBaseMap[mid]);
    if (missing.length === 0) return;

    const loadBase = async () => {
      setIsLoadingBase(true);
      try {
        const entries = await Promise.all(
          missing.map(async (mid) => {
            const res = await fetch(`/api/mediciones/${mid}`);
            const json = await res.json();
            if (json.data?.registros_base) return [mid, parseRegistrosBase(json.data.registros_base)] as const;
            return null;
          })
        );
        setRegistrosBaseMap((prev) => {
          const next = { ...prev };
          entries.forEach((entry) => {
            if (entry) next[entry[0]] = entry[1];
          });
          return next;
        });
      } finally {
        setIsLoadingBase(false);
      }
    };

    loadBase();
  }, [viewMode, selectedMedIds, registrosBaseMap]);

  const medicionesConLabel = useMemo(() => {
    const sorted = [...medicionesRelacionadas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    const counts: Record<string, number> = {};
    sorted.forEach((m) => {
      counts[m.fecha] = (counts[m.fecha] || 0) + 1;
    });
    const tracker: Record<string, number> = {};
    return sorted.map((m) => {
      tracker[m.fecha] = (tracker[m.fecha] || 0) + 1;
      const baseLabel = formatFecha(m.fecha);
      const label = counts[m.fecha] > 1 ? `${baseLabel} (Tramo ${tracker[m.fecha]})` : baseLabel;
      return { id: m.id, label, fecha: m.fecha, datos: m.datos };
    });
  }, [medicionesRelacionadas]);

  const yearColorMap = useMemo(() => {
    const years = Array.from(new Set(medicionesConLabel.map((m) => extractYear(m.fecha)))).filter(Boolean).sort();
    return years.reduce((acc, year, idx) => {
      acc[year] = COLOR_PAIRS[idx % COLOR_PAIRS.length];
      return acc;
    }, {} as Record<string, { izq: string; der: string }>);
  }, [medicionesConLabel]);

  const condPuntual = indicador?.condiciones.find((c) => c.tipo === 'PUNTUAL')?.valor ?? 0;
  const condMedio = indicador?.condiciones.find((c) => c.tipo === 'MEDIO')?.valor ?? 0;
  const unidad = indicador?.unidad_medida || medicion?.datos?.unidad || 'm/km';

  const chartData100m = useMemo(() => {
    return buildChartData100m(
      medicionesConLabel.map((m) => ({ id: m.id, datos: m.datos })),
      selectedMedIds
    );
  }, [medicionesConLabel, selectedMedIds]);

  const chartData20m = useMemo(() => {
    return buildChartData20m(registrosBaseMap, selectedMedIds);
  }, [registrosBaseMap, selectedMedIds]);

  const maxDomain100m = useMemo(() => {
    let maxVal = condPuntual;
    medicionesConLabel
      .filter((m) => selectedMedIds.includes(m.id))
      .forEach((m) => {
        m.datos.registros_puntual.forEach((r) => {
          if (r.valor > maxVal) maxVal = r.valor;
        });
      });
    return getNiceMax(maxVal);
  }, [medicionesConLabel, selectedMedIds, condPuntual]);

  const maxDomain20m = useMemo(() => {
    let maxVal = condPuntual;
    selectedMedIds.forEach((mid) => {
      (registrosBaseMap[mid] || []).forEach((r) => {
        maxVal = Math.max(maxVal, r.iri_izq, r.iri_der);
      });
    });
    return getNiceMax(maxVal);
  }, [selectedMedIds, registrosBaseMap, condPuntual]);

  const baseCurrent = registrosBaseMap[id || ''] || [];
  const baseSummary = useMemo(() => {
    if (baseCurrent.length === 0) return { stats: null, km: [] as IRI_ResumenKm[] };
    return agruparPorKm(baseCurrent, true, condPuntual, condMedio);
  }, [baseCurrent, condPuntual, condMedio]);

  const activeStats = viewMode === '20m' && baseSummary.stats ? baseSummary.stats : medicion?.datos.estadisticas;
  const activeKm = viewMode === '20m' && baseSummary.km.length > 0 ? baseSummary.km : medicion?.datos.resumen_km || [];

  const barChartData = useMemo(() => {
    const active = medicionesConLabel.filter((m) => selectedMedIds.includes(m.id));
    if (active.length === 0) return { data: [], series: [] as Array<{ id: string; label: string; color: string }> };

    const series = active.map((m, idx) => {
      const year = extractYear(m.fecha);
      const pair = year ? yearColorMap[year] : null;
      const fallback = COLOR_PAIRS[idx % COLOR_PAIRS.length];
      return {
        id: m.id,
        label: m.label,
        color: pair?.der || fallback?.der || '#0ea5e9',
      };
    });

    const rowMap = new Map<number, { km_label: string; from_m: number; to_m: number } & Record<string, number | boolean | string | undefined>>();

    active.forEach((m) => {
      const summary = viewMode === '20m'
        ? agruparPorKm(registrosBaseMap[m.id] || [], true, condPuntual, condMedio).km
        : m.datos.resumen_km || [];

      summary.forEach((km) => {
        const key = km.from_m;
        const existing = rowMap.get(key);
        const row = existing ?? { km_label: km.km_label, from_m: km.from_m, to_m: km.to_m };
        row[m.id] = km.valor_medio;
        row[`${m.id}_cumple`] = km.cumple_medio;
        rowMap.set(key, row);
      });
    });

    const data = Array.from(rowMap.values()).sort((a, b) => a.from_m - b.from_m);
    return { data, series };
  }, [medicionesConLabel, selectedMedIds, viewMode, registrosBaseMap, condPuntual, condMedio, yearColorMap]);

  useEffect(() => {
    if (viewMode !== '20m') return;
    if (brushIndexes || chartData20m.length <= 400) return;
    setBrushIndexes({ startIndex: 0, endIndex: Math.min(200, chartData20m.length - 1) });
  }, [viewMode, chartData20m, brushIndexes]);

  const toggleMedicion = (mid: string) => {
    setSelectedMedIds((prev) => (prev.includes(mid) ? prev.filter((x) => x !== mid) : [...prev, mid]));
  };

  const handleBarClick = (payload: { from_m: number; to_m: number }) => {
    if (!payload) return;
    const { from_m, to_m } = payload;
    const data = viewMode === '20m' ? chartData20m : chartData100m;
    if (data.length === 0) return;

    let startIndex = data.findIndex((d) => d.abscisa >= from_m);
    let endIndex = data.findIndex((d) => d.abscisa > to_m);
    if (startIndex < 0) startIndex = 0;
    if (endIndex < 0) endIndex = data.length - 1;
    else endIndex = Math.max(startIndex, endIndex - 1);

    setBrushIndexes({ startIndex, endIndex });
  };

  if (loading) {
    return (
      <AppShell active="mediciones">
        <div className="text-slate-500">Cargando...</div>
      </AppShell>
    );
  }

  if (error || !medicion) {
    return (
      <AppShell active="mediciones">
        <div className="text-red-600">{error || 'No se encontro la medicion'}</div>
      </AppShell>
    );
  }

  const carril = medicion.carriles_seleccionados[0] || 'N/A';

  return (
    <AppShell active="mediciones">
      <div className="space-y-6 animate-in fade-in">
        <div className="text-xs text-slate-500">
          Mediciones / {proyecto?.nombre || 'Proyecto'} / {uf?.nombre || 'UF'} / {ruta?.nombre || 'Ruta'}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#0A1628]">
              {indicador?.nombre || 'Indicador'} <span className="text-slate-500 text-sm">({carril})</span>
            </h1>
            <p className="text-slate-500 text-sm">{indicador?.identificador || ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">{formatFecha(medicion.fecha)}</Badge>
            <Badge variant={medicion.datos.estadisticas.cumple_global ? 'green' : 'red'}>
              {medicion.datos.estadisticas.cumple_global ? 'CUMPLE' : 'INCUMPLE'}
            </Badge>
          </div>
        </div>

        {activeStats ? (
          <EstadisticasCards
            stats={activeStats}
            condPuntual={condPuntual}
            condMedio={condMedio}
            viewMode={viewMode}
            unidad={unidad}
          />
        ) : (
          <Card className="p-4 text-slate-500">Sin estadisticas disponibles.</Card>
        )}

        <Card className="p-4">
          <h3 className="font-bold text-sm mb-3">Tramos disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {medicionesConLabel.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleMedicion(m.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  selectedMedIds.includes(m.id)
                    ? 'bg-[#00C2D4]/20 border-[#00C2D4] text-[#0A1628]'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                {m.label}
              </button>
            ))}
            {medicionesConLabel.length === 0 && (
              <div className="text-xs text-slate-400">Sin tramos relacionados.</div>
            )}
          </div>
        </Card>

        {selectedMedIds.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Selecciona al menos un tramo para visualizar las graficas.
          </div>
        )}

        <GraficaIRI
          viewMode={viewMode}
          setViewMode={setViewMode}
          isLoadingBase={isLoadingBase}
          chartData100m={chartData100m}
          chartData20m={chartData20m}
          selectedMedIds={selectedMedIds}
          medicionesConLabel={medicionesConLabel}
          yearColorMap={yearColorMap}
          condPuntual={condPuntual}
          maxDomain100m={maxDomain100m}
          maxDomain20m={maxDomain20m}
          formatAbscisa={formatAbscisa}
          brushIndexes={brushIndexes}
          setBrushIndexes={setBrushIndexes}
          fullscreenChart={fullscreenChart}
          setFullscreenChart={setFullscreenChart}
          unidad={unidad}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GraficaBarrasKm
            data={barChartData.data}
            series={barChartData.series}
            condMedio={condMedio}
            unidad={unidad}
            onBarClick={handleBarClick}
            fullscreen={fullscreenChart === 'bar'}
            setFullscreen={(val) => setFullscreenChart(val ? 'bar' : null)}
          />
          <TablaResumenKm data={activeKm} viewMode={viewMode} onRowClick={handleBarClick} />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setBrushIndexes(null)}>Restaurar Zoom</Button>
        </div>
      </div>
    </AppShell>
  );
}

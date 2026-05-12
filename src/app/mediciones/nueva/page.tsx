'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ConfiguracionTag, Indicador, Medicion, Proyecto, Ruta, UnidadFuncional } from '@/types';
import { AppShell } from '@/components/layout';
import { InfoBanner } from '@/components/shared/InfoBanner';
import {
  StepCargaDatos,
  StepCarriles,
  StepConfirmacion,
  StepContexto,
  WizardProgress,
} from '@/components/mediciones/wizard';
import { parsearArchivoIRI } from '@/lib/parsers/iriParser';
import { descargarPlantillaIRI } from '@/lib/utils/templateDownload';
import { formatFecha } from '@/lib/utils/formatters';

export default function NuevaMedicionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [ufs, setUfs] = useState<UnidadFuncional[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [tags, setTags] = useState<ConfiguracionTag[]>([]);
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [form, setForm] = useState({ proyecto_id: '', uf_id: '', ruta_id: '', indicador_id: '', fecha: '' });
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<{ datos: any; registrosBase: any[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const todayIso = new Date().toISOString().split('T')[0];

  const proyectoActivo = useMemo(
    () => proyectos.find((p) => p.id === form.proyecto_id) || null,
    [proyectos, form.proyecto_id]
  );
  const ufActiva = useMemo(
    () => ufs.find((u) => u.id === form.uf_id) || null,
    [ufs, form.uf_id]
  );
  const rutaActiva = useMemo(
    () => rutas.find((r) => r.id === form.ruta_id) || null,
    [rutas, form.ruta_id]
  );
  const indicadorActivo = useMemo(
    () => indicadores.find((i) => i.id === form.indicador_id) || null,
    [indicadores, form.indicador_id]
  );

  const carrilesDetalle = useMemo(() => {
    if (!rutaActiva) return [];
    return rutaActiva.carriles_tags.map((tag) => {
      const match = tags.find((t) => t.tag === tag);
      return { tag, descripcion: match?.descripcion };
    });
  }, [rutaActiva, tags]);

  const ultimaMedicion = useMemo(() => {
    if (!form.ruta_id || !form.indicador_id) return null;
    const filtradas = mediciones.filter(
      (m) => m.ruta_id === form.ruta_id && m.indicador_id === form.indicador_id
    );
    if (filtradas.length === 0) return null;
    const ordenadas = [...filtradas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    const ultima = ordenadas[0];
    const dias = Math.floor((Date.now() - new Date(ultima.fecha).getTime()) / (1000 * 60 * 60 * 24));
    const vencida = indicadorActivo?.frecuencia_dias ? dias > indicadorActivo.frecuencia_dias : false;
    return {
      fecha: formatFecha(ultima.fecha),
      dias,
      vencida,
    };
  }, [mediciones, form.ruta_id, form.indicador_id, indicadorActivo]);

  const fetchProyectos = async () => {
    const res = await fetch('/api/proyectos');
    const json = await res.json();
    setProyectos(json.data || []);
  };

  const fetchIndicadores = async () => {
    const res = await fetch('/api/indicadores');
    const json = await res.json();
    setIndicadores(json.data || []);
  };

  const fetchTags = async () => {
    const res = await fetch('/api/configuracion-tags');
    const json = await res.json();
    setTags(json.data || []);
  };

  const fetchMediciones = async () => {
    const res = await fetch('/api/mediciones');
    const json = await res.json();
    setMediciones(json.data || []);
  };

  const fetchUfs = async (proyectoId: string) => {
    if (!proyectoId) return;
    const res = await fetch(`/api/unidades-funcionales?proyecto_id=${proyectoId}`);
    const json = await res.json();
    setUfs(json.data || []);
  };

  const fetchRutas = async (ufId: string) => {
    if (!ufId) return;
    const res = await fetch(`/api/rutas?unidad_funcional_id=${ufId}`);
    const json = await res.json();
    setRutas(json.data || []);
  };

  useEffect(() => {
    Promise.all([fetchProyectos(), fetchIndicadores(), fetchTags(), fetchMediciones()]).catch(() => null);
  }, []);

  useEffect(() => {
    if (!form.proyecto_id) {
      setUfs([]);
      return;
    }
    fetchUfs(form.proyecto_id);
  }, [form.proyecto_id]);

  useEffect(() => {
    if (!form.uf_id) {
      setRutas([]);
      return;
    }
    fetchRutas(form.uf_id);
  }, [form.uf_id]);

  useEffect(() => {
    setSeleccionados([]);
  }, [form.ruta_id]);

  useEffect(() => {
    setParsedData(null);
    setProcessError(null);
  }, [form.indicador_id, form.ruta_id]);

  const toggleCarril = (tag: string) => {
    setSeleccionados((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setProcessError(null);
    try {
      const text = await file.text();
      const condPuntual = indicadorActivo?.condiciones.find((c) => c.tipo === 'PUNTUAL')?.valor ?? 0;
      const condMedio = indicadorActivo?.condiciones.find((c) => c.tipo === 'MEDIO')?.valor ?? 0;
      const parsed = parsearArchivoIRI(text, condPuntual, condMedio);
      setParsedData(parsed);
    } catch (err: any) {
      setProcessError(err.message || 'Error al procesar archivo');
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleResetFile = () => {
    setParsedData(null);
    setProcessError(null);
    setInputKey((k) => k + 1);
  };

  const handleSave = async () => {
    if (!parsedData) return;
    if (!form.proyecto_id || !form.uf_id || !form.ruta_id || !form.indicador_id || !form.fecha) return;
    if (seleccionados.length === 0) return;

    setSaving(true);
    setError(null);
    try {
      for (const carril of seleccionados) {
        const payload = {
          proyecto_id: form.proyecto_id,
          unidad_funcional_id: form.uf_id,
          ruta_id: form.ruta_id,
          carriles_seleccionados: [carril],
          indicador_id: form.indicador_id,
          fecha: form.fecha,
          datos: parsedData.datos,
          tiene_datos_base: true,
          registros_base: parsedData.registrosBase,
        };
        const res = await fetch('/api/mediciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error.message || 'Error al guardar');
      }
      router.push('/mediciones');
    } catch (e: any) {
      setError(e.message || 'Error al guardar medicion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell active="mediciones">
      <div className="space-y-6 animate-in fade-in">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#0A1628]">Nueva Medicion</h1>
          <p className="text-slate-500 text-sm">Carga guiada de un archivo CSV y validacion automatica.</p>
        </div>

        <InfoBanner title="Wizard de Carga">
          Completa los pasos para registrar una medicion y guardar los registros base.
        </InfoBanner>

        <WizardProgress step={step} />

        {error && <div className="text-red-600">{error}</div>}
        {saving && <div className="text-slate-500">Guardando...</div>}

        {step === 1 && (
          <StepContexto
            form={form}
            setForm={setForm}
            proyectos={proyectos}
            ufs={ufs}
            rutas={rutas}
            indicadores={indicadores}
            maxFecha={todayIso}
            ultimaMedicion={ultimaMedicion}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepCarriles
            carriles={carrilesDetalle}
            seleccionados={seleccionados}
            toggleCarril={toggleCarril}
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepCargaDatos
            parsedData={parsedData}
            isProcessing={isProcessing}
            processError={processError}
            onFileUpload={handleFileUpload}
            onPrev={() => setStep(2)}
            onNext={() => setStep(4)}
            onDescargarTemplate={descargarPlantillaIRI}
            onResetFile={handleResetFile}
            inputKey={String(inputKey)}
          />
        )}

        {step === 4 && parsedData && (
          <StepConfirmacion
            parsedData={parsedData}
            rutaActiva={rutaActiva}
            proyectoNombre={proyectoActivo?.nombre || ''}
            ufNombre={ufActiva?.nombre || ''}
            indicadorNombre={indicadorActivo ? `${indicadorActivo.identificador} - ${indicadorActivo.nombre}` : ''}
            fecha={form.fecha ? formatFecha(form.fecha) : ''}
            carriles={seleccionados}
            onPrev={() => setStep(3)}
            onSave={handleSave}
          />
        )}
      </div>
    </AppShell>
  );
}

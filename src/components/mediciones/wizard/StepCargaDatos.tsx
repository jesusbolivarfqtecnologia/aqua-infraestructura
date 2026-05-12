import * as React from 'react';
import { ChevronLeft, ChevronRight, Download, UploadCloud } from 'lucide-react';
import type { DatosIRI } from '@/types';
import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';

export function StepCargaDatos({
  parsedData,
  isProcessing,
  processError,
  onFileUpload,
  onPrev,
  onNext,
  onDescargarTemplate,
  onResetFile,
  inputKey,
}: {
  parsedData: { datos: DatosIRI; registrosBase: any[] } | null;
  isProcessing: boolean;
  processError: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrev: () => void;
  onNext: () => void;
  onDescargarTemplate: () => void;
  onResetFile: () => void;
  inputKey?: string;
}) {
  return (
    <Card className="p-6 animate-in fade-in">
      <h2 className="text-lg font-bold mb-6 border-b pb-2">3. Carga de Datos</h2>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600">
          El archivo debe tener exactamente 5 columnas separadas por coma. <strong>No incluir RUTA ni columnas de promedios.</strong>
        </p>
        <Button variant="outline" size="sm" onClick={onDescargarTemplate}>
          <Download className="w-4 h-4 mr-2" /> Descargar plantilla
        </Button>
      </div>

      {!parsedData && !isProcessing && (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center relative">
          <input
            key={inputKey}
            type="file"
            accept=".csv"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onFileUpload}
          />
          <UploadCloud className="w-12 h-12 text-[#00C2D4] mx-auto mb-4" />
          <h3 className="font-bold">Arrastra el archivo CSV aqui</h3>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-md text-sm text-slate-600">
          Procesando archivo, por favor espera...
        </div>
      )}

      {processError && <div className="bg-red-50 text-red-600 p-4 rounded-md mt-4 border">{processError}</div>}

      {parsedData && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
            <h4 className="font-bold text-emerald-800">Procesado Correctamente</h4>
            <p className="text-sm">Analizados {parsedData.datos.estadisticas.total_registros_base} registros base con un intervalo dinamico de {parsedData.datos.intervalo_base_m}m.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-md bg-white border">
              <p className="text-xs text-slate-500">Puntuales</p>
              <p className="text-lg font-bold">{parsedData.datos.estadisticas.total_puntuales}</p>
            </div>
            <div className="p-3 rounded-md bg-white border">
              <p className="text-xs text-slate-500">Valor medio global</p>
              <p className="text-lg font-bold">{parsedData.datos.estadisticas.valor_medio_global.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-md bg-white border">
              <p className="text-xs text-slate-500">Valor max puntual</p>
              <p className="text-lg font-bold">{parsedData.datos.estadisticas.valor_max_puntual.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-md bg-white border">
              <p className="text-xs text-slate-500">Cumplimiento</p>
              <p className="text-lg font-bold">{parsedData.datos.estadisticas.porcentaje_cumplimiento.toFixed(1)}%</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onResetFile} className="w-full">Subir otro archivo</Button>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onPrev}><ChevronLeft className="w-4 h-4 mr-1" /> Anterior</Button>
        <Button onClick={onNext} disabled={!parsedData}>Siguiente <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </Card>
  );
}

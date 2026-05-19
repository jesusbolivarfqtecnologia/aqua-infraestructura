# Plan de escalabilidad para indicadores y mediciones

## Objetivo
Disenar una arquitectura que permita incorporar muchos indicadores con reglas, formatos de datos y visualizaciones diferentes, manteniendo consistencia, trazabilidad y desempeno, respetando que cada indicador conserva su propio modelo de datos y solo cambia la especificacion/version de ese modelo.

## Diagnostico rapido (estado actual)
- Un solo tipo de indicador (IRI) modelado en JSONB dentro de `mediciones.datos` y un solo flujo de parsing/agregacion.
- La visualizacion esta acoplada a IRI en componentes de mediciones.
- `mediciones_registros_base` guarda payload crudo sin versionamiento ni esquema por indicador.
- La especificacion del modelo de cada indicador no esta versionada ni registrada formalmente.

## Modelo base del indicador (segun PDF)
El indicador conserva su propio modelo de datos, pero debe incluir y versionar su especificacion con estos campos obligatorios:
- Nombre
- Identificador
- Concepto de Medicion
- Normatividad Especifica Aplicable
- Frecuencia Maxima de Medicion
- Unidad de Medicion
- Metodo de Medida
- Valor de Aceptacion (minimo/maximo, rango o tabla por categoria)
- Tiempo Maximo de Correccion

Implicacion clave: estos campos son metadata fija del indicador y deben existir en la tabla `indicadores` y en su `schema` versionado. El `Valor de Aceptacion` se representa como reglas (una o mas) y el `Tiempo Maximo de Correccion` puede variar por contexto (p. ej. antes/despues ATUF-ATPUF).

Requisitos observados en el PDF que impactan el modelo:
- Segmentacion por km para evaluar cumplimiento (segmentos de 1 km).
- Intervalos de muestreo definidos por indicador (p. ej. 20 m o 50 m).
- Reglas condicionales por tipo de via (calzada/cicloruta), nivel de transito o periodo.
- Doble calzada se evalua por separado y suma longitudes.

## Arquitectura objetivo (patrones y capas)
### 1) Registro de indicadores (Factory + Strategy)
Crear un registro de indicadores que resuelva una "estrategia" por tipo:
- `IndicatorRegistry.get(type)` retorna un modulo con:
  - `parse(input)`
  - `validate(data)`
  - `summarize(data)`
  - `charts(data)`
  - `templates()`

Patrones:
- Strategy: cada indicador implementa su propio pipeline.
- Factory/Registry: selecciona estrategia por `indicador.tipo` o `identificador`.
- Adapter: convierte distintos formatos de entrada (CSV/Excel/API) al modelo propio del indicador segun su especificacion.

### 2) Envelope + esquema por indicador
Definir un contenedor comun y mantener el payload especifico del indicador:
- `MeasurementEnvelope`: metadata comun (id, indicador, version, fechas) + `payload` especifico del indicador.
- `IndicatorSchemaSpec`: definicion/plantilla versionada del modelo propio del indicador (JSON Schema o similar).
- `MeasurementSummary`: agregados estandarizados para cards/tabla/graficas.

Beneficios:
- No se fuerza un modelo unico; cada indicador conserva su estructura.
- Las vistas solo consumen `MeasurementSummary` y `charts()`, no conocen detalles del indicador.

### 3) UI modular y componible
Crear un "dashboard" generico que renderice por definicion:
- `IndicatorHeader` (nombre, unidad, condiciones)
- `IndicatorFilters`
- `IndicatorCharts` (config entregada por el indicador)
- `IndicatorTables`

Patrones:
- Composition: un layout comun con slots.
- Config-driven UI: `charts()` devuelve definiciones (series, ejes, tooltip) para Recharts.
- Mostrar matriz de aceptacion cuando la regla sea tabular (p. ej. por nivel de transito).
- Escape hatch: si un indicador requiere UI unica, el plugin puede exponer un componente propio.

## Diseno de datos (base de datos)
### 1) Tabla `indicadores` enriquecida
Agregar campos:
- `tipo` (slug estable para resolver estrategia)
- `version_schema` (string)
- `schema` (JSONB) para validar payloads y plantillas del modelo propio
- `schema_history` o tabla `indicadores_versiones` para versionar cambios de especificacion
- Validaciones de presencia para los campos base del indicador (nombre, identificador, concepto, normatividad, frecuencia maxima, unidad, metodo, valor de aceptacion, tiempo maximo de correccion)
- Guardar reglas de aceptacion y correccion en estructura JSON con `context` (calzada, cicloruta, nivel_transito, periodo)
- Guardar parametros de segmentacion y muestreo (p. ej. `segmento_m`, `intervalo_m`)

### 2) Versionar mediciones
Agregar campos a `mediciones`:
- `tipo` (redundante pero util)
- `version_payload` (version del schema aplicado)
- `estado_validacion` (ok/warn/error)
- `metadatos` (origen, equipo, operador)
- `schema_snapshot` (opcional) para auditoria del modelo usado
- `fecha_medicion` y `fecha_cumplimiento` (opcional) para evaluar tiempos maximos de correccion
- `contexto` (p. ej. calzada/cicloruta, nivel_transito, periodo ATUF-ATPUF) para aplicar reglas

### 3) Almacenamiento crudo y normalizado
Opciones recomendadas:
- Mantener `mediciones_registros_base` para raw y sumar:
  - `schema` o `version`
  - `compressed` opcional
- Crear tabla `mediciones_series` (opcional) para datos intensivos:
  - `medicion_id`, `serie`, `x`, `y`, `meta`
  - indices por `medicion_id` y rango

### 4) Agregados precomputados
Crear tabla `mediciones_resumen`:
- `medicion_id`
- `resumen` JSONB (cards, km, percentiles, etc.)
- Esto evita recalculos en cada vista.

## Pipeline de procesamiento (por indicador)
1) Ingesta: subir archivo o payload
2) Resolver esquema: obtener `IndicatorSchemaSpec` vigente
3) Parsing (Adapter): convertir al modelo propio del indicador
4) Validacion (Schema + reglas de negocio + campos base del indicador)
5) Agregacion (Strategy) -> `MeasurementSummary`
6) Persistencia (raw + resumen + version/schema + contexto)

## Plan por fases
### Fase 0: Fundacion (1-2 semanas)
- Crear `IndicatorRegistry` y mover IRI como primer plugin.
- Definir contratos (`MeasurementEnvelope`, `IndicatorSchemaSpec`, `MeasurementSummary`).
- Ajustar componentes para consumir `charts()` y `summary` genericos.

### Fase 1: Datos y versionado (1-2 semanas)
- Migrar DB con campos `tipo`, `version_payload`, `schema`.
- Crear historial de esquemas por indicador.
- Agregar tabla `mediciones_resumen`.
- Backfill para IRI (generar resumen y version actual).

### Fase 2: Escalado UI (1-2 semanas)
- `IndicadorDashboard` generico con slots.
- `ChartRenderer` que recibe configuraciones del plugin.
- Catalogo de templates por indicador.

### Fase 3: Nuevos indicadores (continuo)
- Implementar indicadores de forma incremental (uno por ciclo).
- Afinar validadores, plantillas y adaptadores por indicador.
- Ajustar rendimiento con `mediciones_series` si se requiere.

## Estrategia incremental (onboarding por indicador)
La idea es incorporar indicadores distintos poco a poco, con un proceso repetible:
1) Ficha del indicador: capturar campos base + reglas de aceptacion + contexto.
2) Definir `schema` versionado y dataset de ejemplo.
3) Implementar Adapter de entrada (CSV/Excel) -> modelo propio.
4) Validaciones + reglas de negocio.
5) Summary y charts minimos para lectura operativa.
6) Feature flag por indicador para activar/desactivar en la UI.
7) QA con datos reales y firma de validacion.

Checklist de alta (por indicador):
- Campos base completos (nombre, identificador, normatividad, frecuencia, unidad, metodo).
- Reglas de aceptacion claras y mapeadas a `contexto`.
- Segmentacion y muestreo definidos (km, intervalo).
- Dataset de prueba y expected output.
- Vistas minimas (cards + grafica principal + tabla resumen).

## Revisiones de calidad y control
- Validaciones por esquema (JSON Schema/Zod) por indicador.
- Registros de errores con detalle por fila/columna.
- Reporte de calidad de datos (porcentaje de filas invalidas, rangos fuera de norma).
- Versionado de templates y payloads para trazabilidad.
- Auditoria de cumplimiento: comparar contra `Valor de Aceptacion` y controlar `Tiempo Maximo de Correccion`.
- Evaluacion por segmento (1 km) con reglas condicionales segun contexto.

## Entregables clave
- `lib/indicadores/registry.ts`
- `lib/indicadores/plugins/iri.ts`
- `lib/indicadores/types.ts`
- `components/indicadores/IndicatorDashboard.tsx`
- Migraciones DB para versionado y resumen

## Riesgos y mitigaciones
- Cambio de esquema: versionado y snapshot del schema por medicion.
- Rendimiento: precomputar resmenes y paginar series.
- Heterogeneidad de datos: schemas estrictos y adaptadores por indicador.

## Proxima decision requerida
- Definir lista priorizada de nuevos indicadores y sus formatos.
- Elegir si `mediciones_series` se implementa desde el inicio o en fase 3.
- Definir el orden de incorporacion y la cadencia (p. ej. 1 indicador cada 2-3 semanas).


# AQUA-Infraestructura — Especificación Técnica Completa
> Documento de referencia para el agente de desarrollo. Leer completo antes de escribir cualquier línea de código.

---

## 0. CONTEXTO GENERAL

**AQUA-Infraestructura** es una plataforma web para la gestión de indicadores de concesiones viales. Permite registrar la jerarquía física de una vía (Proyecto → Unidad Funcional → Ruta → Carriles), configurar los indicadores normativos con sus condiciones de aceptación, cargar mediciones desde archivos CSV producidos por equipos de campo, y visualizar los resultados de cumplimiento con gráficas interactivas.

### Referencia de código existente
Se adjunta un archivo `.tsx` de prototipo funcional construido en Gemini Canvas. Ese archivo contiene **toda la lógica de negocio validada** (parser CSV, cálculo de valores puntual/medio, agrupación por km, etc.). El agente **debe trasladar esa lógica fielmente** al stack de producción, sin reinventarla.

### Restricciones clave
- **Sin autenticación por ahora.** No implementar login, sesiones ni RLS en Supabase en esta fase.
- **Sin pruebas.** No generar archivos de test de ningún tipo.
- **Modular ante todo.** Cada entidad, página, componente y función de servidor debe vivir en su propio archivo.
- **Eliminación protegida.** Ningún registro puede eliminarse si tiene dependientes activos. El backend debe verificar esto antes de borrar.

---

## 1. STACK TECNOLÓGICO

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Lenguaje | TypeScript | 5.x |
| Base de datos | Supabase local (`supabase start`) | CLI 1.x |
| ORM/Client | `@supabase/supabase-js` | 2.x |
| UI base | shadcn/ui | última |
| Estilos | Tailwind CSS | 3.x |
| Gráficas | Recharts | 2.x |
| Gestor de paquetes | pnpm | 8.x |
| Íconos | lucide-react | última |
| Parser CSV | papaparse | 5.x |
| Formularios | react-hook-form + zod | últimas |
| Notificaciones | sonner | última |
| Fuentes | next/font (Google: Syne + DM Sans) | — |

### Comandos de inicialización del proyecto

```bash
# 1. Crear proyecto Next.js
pnpm create next-app@latest aqua-infraestructura \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd aqua-infraestructura

# 2. Inicializar shadcn/ui
pnpm dlx shadcn@latest init

# 3. Instalar dependencias adicionales
pnpm add @supabase/supabase-js recharts papaparse \
         react-hook-form @hookform/resolvers zod sonner lucide-react

pnpm add -D @types/papaparse supabase

# 4. Inicializar Supabase local
pnpm supabase init
pnpm supabase start

# 5. Componentes shadcn necesarios (ejecutar uno a uno)
pnpm dlx shadcn@latest add button input textarea select card badge
pnpm dlx shadcn@latest add dialog alert-dialog sheet table
pnpm dlx shadcn@latest add form label separator tooltip
pnpm dlx shadcn@latest add progress skeleton
```

---

## 2. ESTRUCTURA DE CARPETAS

```
src/
├── app/
│   ├── layout.tsx                    # Layout raíz (fuentes, Toaster)
│   ├── page.tsx                      # Redirect → /proyectos
│   ├── proyectos/
│   │   └── page.tsx
│   ├── rutas/
│   │   └── page.tsx                  # Unidades Funcionales & Rutas
│   ├── carriles/
│   │   └── page.tsx                  # Plantillas de Carriles
│   ├── indicadores/
│   │   └── page.tsx
│   ├── mediciones/
│   │   ├── page.tsx                  # Listado de mediciones
│   │   ├── nueva/
│   │   │   └── page.tsx              # Wizard de nueva medición
│   │   └── [id]/
│   │       └── page.tsx              # Detalle y gráficas
│   └── api/
│       ├── proyectos/
│       │   ├── route.ts              # GET, POST
│       │   └── [id]/
│       │       └── route.ts          # GET, PUT, DELETE
│       ├── unidades-funcionales/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── configuracion-tags/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── rutas/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── indicadores/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       └── mediciones/
│           ├── route.ts
│           └── [id]/
│               └── route.ts
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── SidebarItem.tsx
│   │   └── AppHeader.tsx
│   ├── ui/                           # Componentes shadcn (auto-generados)
│   ├── shared/
│   │   ├── InlineEdit.tsx
│   │   ├── TagMultiSelect.tsx
│   │   ├── SlidePanel.tsx
│   │   ├── ConfirmDeleteDialog.tsx
│   │   ├── InfoBanner.tsx
│   │   ├── EmptyState.tsx
│   │   └── PageHeader.tsx
│   ├── proyectos/
│   │   └── ProyectoForm.tsx
│   ├── rutas/
│   │   ├── UFTable.tsx
│   │   ├── RutasPanel.tsx
│   │   └── RutaRow.tsx
│   ├── carriles/
│   │   └── ConfigTagForm.tsx
│   ├── indicadores/
│   │   ├── IndicadorForm.tsx
│   │   ├── IndicadorDetalle.tsx
│   │   └── CondicionesEditor.tsx
│   └── mediciones/
│       ├── wizard/
│       │   ├── WizardProgress.tsx
│       │   ├── StepContexto.tsx
│       │   ├── StepCarriles.tsx
│       │   ├── StepCargaDatos.tsx
│       │   └── StepConfirmacion.tsx
│       ├── MedicionCard.tsx
│       ├── GraficaIRI.tsx            # Gráfica principal multi-año
│       ├── GraficaBarrasKm.tsx       # Barras por km
│       ├── TablaResumenKm.tsx
│       └── EstadisticasCards.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient
│   │   └── server.ts                 # createServerClient (para API routes)
│   ├── parsers/
│   │   └── iriParser.ts              # Lógica de parseo CSV (trasladar del prototipo)
│   ├── validators/
│   │   └── indicadorValidator.ts     # Validación de mediciones contra condiciones
│   └── utils/
│       ├── formatters.ts             # formatAbscisa, formatFecha, etc.
│       ├── colorPairs.ts             # COLOR_PAIRS, YEAR_COLORS
│       └── chartHelpers.ts           # getNiceMax, agruparPorKm
│
├── hooks/
│   ├── useProyectos.ts
│   ├── useUnidadesFuncionales.ts
│   ├── useConfigTags.ts
│   ├── useRutas.ts
│   ├── useIndicadores.ts
│   └── useMediciones.ts
│
└── types/
    └── index.ts                      # Todos los tipos e interfaces
```

---

## 3. BASE DE DATOS — ESQUEMA SUPABASE (PostgreSQL)

### 3.1 Archivo de migración: `supabase/migrations/001_initial_schema.sql`

```sql
-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: proyectos
-- ============================================================
CREATE TABLE proyectos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL CHECK (char_length(trim(nombre)) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: unidades_funcionales
-- ============================================================
CREATE TABLE unidades_funcionales (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre       TEXT NOT NULL CHECK (char_length(trim(nombre)) > 0),
  proyecto_id  UUID NOT NULL REFERENCES proyectos(id),
  -- ⚠️ NO usar ON DELETE CASCADE: la eliminación se controla desde el backend
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: configuracion_tags (catálogo de carriles)
-- ============================================================
CREATE TABLE configuracion_tags (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag          TEXT NOT NULL UNIQUE CHECK (char_length(trim(tag)) > 0),
  descripcion  TEXT NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('bifurcado', 'unico')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: rutas
-- ============================================================
CREATE TABLE rutas (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre                TEXT NOT NULL CHECK (char_length(trim(nombre)) > 0),
  unidad_funcional_id   UUID NOT NULL REFERENCES unidades_funcionales(id),
  carriles_tags         TEXT[] NOT NULL DEFAULT '{}',
  -- Array de tags Ej: ['DD', 'DI']
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: indicadores
-- ============================================================
CREATE TABLE indicadores (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre                      TEXT NOT NULL,
  identificador               TEXT NOT NULL UNIQUE CHECK (char_length(trim(identificador)) > 0),
  concepto_medicion           TEXT NOT NULL DEFAULT '',
  normatividad                TEXT NOT NULL DEFAULT '',
  metodo_medida               TEXT NOT NULL DEFAULT '',
  frecuencia                  TEXT NOT NULL CHECK (frecuencia IN (
                                'SEMANAL','QUINCENAL','MENSUAL','BIMESTRAL',
                                'TRIMESTRAL','SEMESTRAL','ANUAL'
                              )),
  frecuencia_dias             INTEGER NOT NULL CHECK (frecuencia_dias > 0),
  unidad_medida               TEXT NOT NULL DEFAULT '',
  tiempo_correccion_valor     INTEGER CHECK (tiempo_correccion_valor IS NULL OR tiempo_correccion_valor > 0),
  tiempo_correccion_unidad    TEXT NOT NULL DEFAULT 'N/A' CHECK (tiempo_correccion_unidad IN ('N/A','HORAS','MESES')),
  condiciones                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- JSONB Array de CondicionIndicador[]
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: mediciones
-- ============================================================
CREATE TABLE mediciones (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id             UUID NOT NULL REFERENCES proyectos(id),
  unidad_funcional_id     UUID NOT NULL REFERENCES unidades_funcionales(id),
  ruta_id                 UUID NOT NULL REFERENCES rutas(id),
  carriles_seleccionados  TEXT[] NOT NULL DEFAULT '{}',
  indicador_id            UUID NOT NULL REFERENCES indicadores(id),
  fecha                   DATE NOT NULL,
  -- Datos compactos (sin registros_base, que van en tabla separada)
  datos                   JSONB NOT NULL,
  -- Estructura: DatosIRI sin registros_base
  tiene_datos_base        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: mediciones_registros_base (datos pesados, separados)
-- ============================================================
CREATE TABLE mediciones_registros_base (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicion_id  UUID NOT NULL REFERENCES mediciones(id),
  -- Un registro por fila del CSV (20m)
  from_m       NUMERIC NOT NULL,
  to_m         NUMERIC NOT NULL,
  iri_izq      NUMERIC NOT NULL,
  iri_der      NUMERIC NOT NULL,
  promedio     NUMERIC NOT NULL GENERATED ALWAYS AS ((iri_izq + iri_der) / 2) STORED
);

-- Índice para consultas rápidas por medición
CREATE INDEX idx_mediciones_registros_base_medicion
  ON mediciones_registros_base(medicion_id, from_m);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_proyectos
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_ufs
  BEFORE UPDATE ON unidades_funcionales
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_rutas
  BEFORE UPDATE ON rutas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_indicadores
  BEFORE UPDATE ON indicadores
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_mediciones
  BEFORE UPDATE ON mediciones
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- DATOS SEMILLA
-- ============================================================
INSERT INTO configuracion_tags (tag, descripcion, tipo) VALUES
  ('DD', 'Calzada Derecha - Carril Derecho',   'bifurcado'),
  ('DI', 'Calzada Derecha - Carril Izquierdo',  'bifurcado'),
  ('ID', 'Calzada Izquierda - Carril Derecho',  'bifurcado'),
  ('II', 'Calzada Izquierda - Carril Izquierdo','bifurcado'),
  ('D',  'Calzada Única - Carril Derecho',      'unico'),
  ('I',  'Calzada Única - Carril Izquierdo',    'unico');

INSERT INTO indicadores (
  nombre, identificador, concepto_medicion, normatividad, metodo_medida,
  frecuencia, frecuencia_dias, unidad_medida,
  tiempo_correccion_valor, tiempo_correccion_unidad, condiciones
) VALUES (
  'IRI',
  'E1',
  'Rugosidad Longitudinal según el índice de Rugosidad Internacional (en m/km)',
  E'INV E-790-13\nINV-E-794-13\nArt.440.5.2.6.8 y/o Art.450.5.2.5.9\nEspecificaciones Generales de Construcción INVIAS 2013.',
  E'La unidad de medida será el IRI cada 100 m. Se tomarán medidas en las dos rodadas o huellas del carril, por donde circulen más vehículos pesados en cada sentido de circulación.',
  'SEMESTRAL',
  180,
  'm/km',
  3,
  'MESES',
  '[
    {"id":"c1","nombre":"Valor puntual","operador":"<=","valor":3.5,"unidad":"m/km","tipo":"PUNTUAL"},
    {"id":"c2","nombre":"Valor medio","operador":"<=","valor":3.0,"unidad":"m/km","tipo":"MEDIO"}
  ]'::jsonb
);
```

---

## 4. TIPOS TYPESCRIPT — `src/types/index.ts`

```typescript
// ============================================================
// ENUMS Y CONSTANTES
// ============================================================

export const FRECUENCIAS = {
  SEMANAL:    { label: 'Semanal',    dias: 7   },
  QUINCENAL:  { label: 'Quincenal',  dias: 15  },
  MENSUAL:    { label: 'Mensual',    dias: 30  },
  BIMESTRAL:  { label: 'Bimestral',  dias: 60  },
  TRIMESTRAL: { label: 'Trimestral', dias: 90  },
  SEMESTRAL:  { label: 'Semestral',  dias: 180 },
  ANUAL:      { label: 'Anual',      dias: 365 },
} as const;

export type FrecuenciaKey    = keyof typeof FRECUENCIAS;
export type OperadorCondicion = '<=' | '>=' | '<' | '>' | '==' | 'between';
export type TipoCondicion     = 'PUNTUAL' | 'MEDIO' | 'GENERAL';
export type UnidadCorreccion  = 'N/A' | 'HORAS' | 'MESES';
export type TipoTag           = 'bifurcado' | 'unico';

// ============================================================
// ENTIDADES DE DOMINIO
// ============================================================

export interface Proyecto {
  id:         string;
  nombre:     string;
  created_at: string;
  updated_at: string;
}

export interface UnidadFuncional {
  id:          string;
  nombre:      string;
  proyecto_id: string;
  created_at:  string;
  updated_at:  string;
}

export interface ConfiguracionTag {
  id:          string;
  tag:         string;
  descripcion: string;
  tipo:        TipoTag;
  created_at:  string;
  updated_at:  string;
}

export interface Ruta {
  id:                   string;
  nombre:               string;
  unidad_funcional_id:  string;
  carriles_tags:        string[];
  created_at:           string;
  updated_at:           string;
}

export interface CondicionIndicador {
  id:        string;
  nombre:    string;
  operador:  OperadorCondicion;
  valor:     number;
  valor_max?: number;
  unidad:    string;
  tipo:      TipoCondicion;
}

export interface Indicador {
  id:                       string;
  nombre:                   string;
  identificador:            string;
  concepto_medicion:        string;
  normatividad:             string;
  metodo_medida:            string;
  frecuencia:               FrecuenciaKey;
  frecuencia_dias:          number;
  unidad_medida:            string;
  tiempo_correccion_valor:  number | null;
  tiempo_correccion_unidad: UnidadCorreccion;
  condiciones:              CondicionIndicador[];
  created_at:               string;
  updated_at:               string;
}

// ============================================================
// DATOS DE MEDICIÓN IRI
// ============================================================

export interface IRI_RegistroBase {
  from_m:   number;
  to_m:     number;
  iri_izq:  number;
  iri_der:  number;
  promedio: number;
}

export interface IRI_RegistroPuntual {
  from_m:         number;
  to_m:           number;
  valor:          number;
  cumple_puntual: boolean;
}

export interface IRI_ResumenKm {
  km_label:         string;
  from_m:           number;
  to_m:             number;
  valor_medio:      number;
  n_puntuales:      number;
  n_incumplimientos: number;
  cumple_medio:     boolean;
  cumple_km:        boolean;
}

export interface IRI_Estadisticas {
  total_registros_base:      number;
  total_puntuales:           number;
  valor_medio_global:        number;
  valor_max_puntual:         number;
  valor_min_puntual:         number;
  n_incumplimientos_puntual: number;
  n_km_incumplen:            number;
  porcentaje_cumplimiento:   number;
  cumple_global:             boolean;
}

export interface DatosIRI {
  tipo:               'IRI';
  version:            '1.0';
  unidad:             string;
  intervalo_base_m:   number;
  intervalo_puntual_m: number;
  registros_puntual:  IRI_RegistroPuntual[];
  resumen_km:         IRI_ResumenKm[];
  estadisticas:       IRI_Estadisticas;
}

// DatosIRI sin registros_base → lo que se guarda en `mediciones.datos`
export type DatosMedicionCompacta = DatosIRI;

// ============================================================
// ENTIDAD: MEDICIÓN
// ============================================================

export interface Medicion {
  id:                     string;
  proyecto_id:            string;
  unidad_funcional_id:    string;
  ruta_id:                string;
  carriles_seleccionados: string[];
  indicador_id:           string;
  fecha:                  string;   // 'YYYY-MM-DD'
  datos:                  DatosMedicionCompacta;
  tiene_datos_base:       boolean;
  created_at:             string;
  updated_at:             string;
}

// ============================================================
// DTOs PARA API
// ============================================================

export type CreateProyectoDTO        = Pick<Proyecto, 'nombre'>;
export type UpdateProyectoDTO        = Partial<CreateProyectoDTO>;

export type CreateUFDTO              = Pick<UnidadFuncional, 'nombre' | 'proyecto_id'>;
export type UpdateUFDTO              = Partial<Pick<UnidadFuncional, 'nombre'>>;

export type CreateConfigTagDTO       = Pick<ConfiguracionTag, 'tag' | 'descripcion' | 'tipo'>;
export type UpdateConfigTagDTO       = Partial<CreateConfigTagDTO>;

export type CreateRutaDTO            = Pick<Ruta, 'nombre' | 'unidad_funcional_id' | 'carriles_tags'>;
export type UpdateRutaDTO            = Partial<Pick<Ruta, 'nombre' | 'carriles_tags'>>;

export type CreateIndicadorDTO       = Omit<Indicador, 'id' | 'created_at' | 'updated_at' | 'frecuencia_dias'>;
export type UpdateIndicadorDTO       = Partial<CreateIndicadorDTO>;

export type CreateMedicionDTO = {
  proyecto_id:            string;
  unidad_funcional_id:    string;
  ruta_id:                string;
  carriles_seleccionados: string[];
  indicador_id:           string;
  fecha:                  string;
  datos:                  DatosMedicionCompacta;
  tiene_datos_base:       boolean;
  registros_base?:        IRI_RegistroBase[];
};

// ============================================================
// RESPUESTAS API ESTANDARIZADAS
// ============================================================

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    code:    string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Códigos de error del negocio
export const ERROR_CODES = {
  NOT_FOUND:            'NOT_FOUND',
  HAS_DEPENDENTS:       'HAS_DEPENDENTS',
  DUPLICATE_KEY:        'DUPLICATE_KEY',
  VALIDATION_ERROR:     'VALIDATION_ERROR',
  INTERNAL:             'INTERNAL_ERROR',
} as const;
```

---

## 5. CLIENTE SUPABASE — `src/lib/supabase/`

### `client.ts` (para componentes cliente)
```typescript
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### `server.ts` (para API routes y Server Components)
```typescript
import { createClient } from '@supabase/supabase-js';

// Usar service_role key en server para evitar problemas de RLS (sin auth aún)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key del output de supabase start>
SUPABASE_SERVICE_ROLE_KEY=<service_role key del output de supabase start>
```

---

## 6. LÓGICA DE NEGOCIO — `src/lib/`

### 6.1 `parsers/iriParser.ts`
Trasladar **exactamente** la función `parsearArchivoIRI` y `agruparPorKm` del prototipo.

Reglas a respetar:
- Acepta CSV con 5 columnas: `From (m)`, `To (m)`, `Distance (m)`, `IRI, Left (mm/m)`, `IRI, Right (mm/m)`
- Soporta formatos de abscisa: `PR02+080`, `K2+080`, número plano
- Detecta el separador automáticamente (`,` `;` o `\t`)
- Salta la fila de encabezado detectándola dinámicamente (primer fila con valores numéricos válidos)
- `promedio_20m = (iri_izq + iri_der) / 2` → calculado, no leído del archivo
- Agrupa en puntuales de 100m: promedio de cada 5 filas consecutivas
- Agrupa en resumen por km: ventanas de 1000m desde la abscisa inicial
- Retorna `DatosIRI` sin `registros_base` en la firma pública (los registros_base se pasan separado al backend)

```typescript
// Firma pública esperada:
export function parsearArchivoIRI(
  csvText: string,
  condicionPuntual: number,
  condicionMedio: number
): { datos: DatosIRI; registrosBase: IRI_RegistroBase[] }
// Retorna datos compactos y registros_base separados

export function agruparPorKm(
  records: IRI_RegistroPuntual[],
  condPuntual: number,
  condMedio: number
): { stats: IRI_Estadisticas; km: IRI_ResumenKm[] }
```

### 6.2 `utils/formatters.ts`
```typescript
// Convierte número a abscisa: 2080 → "K2+080"
export function formatAbscisa(val: number): string

// Fecha ISO → "DD/MM/YYYY"
export function formatFecha(iso: string): string

// Extrae año de fecha ISO
export function extractYear(fecha: string): string
```

### 6.3 `utils/chartHelpers.ts`
```typescript
// Calcula eje Y máximo "limpio" para las gráficas
export function getNiceMax(val: number): number

// Paleta de colores para hasta 6 años/tramos
export const COLOR_PAIRS: Array<{ izq: string; der: string }>

// Construye datos planos para ComposedChart multi-tramo
export function buildChartData100m(
  mediciones: Array<{ id: string; datos: DatosIRI }>,
  selectedIds: string[]
): Record<string, number | undefined>[]

export function buildChartData20m(
  baseDataMap: Record<string, IRI_RegistroBase[]>,
  selectedIds: string[]
): Record<string, number | undefined>[]
```

### 6.4 `validators/indicadorValidator.ts`
```typescript
export function validarCondicion(
  valor: number,
  condicion: CondicionIndicador
): boolean

export function validarMedicion(
  valorPuntual: number,
  valorMedio: number | null,
  condiciones: CondicionIndicador[]
): Array<{ condicion: CondicionIndicador; cumple: boolean; mensaje: string }>
```

### 6.5 `utils/templateDownload.ts`
```typescript
// Genera y descarga la plantilla CSV para el IRI
export function descargarPlantillaIRI(): void
// Contenido: cabecera + 5 filas de ejemplo en formato PR02+080
```

---

## 7. API ROUTES — ESPECIFICACIÓN COMPLETA

### Patrón de respuesta estándar
Todas las rutas retornan:
```json
// Éxito:
{ "data": <payload>, "error": null }

// Error:
{ "data": null, "error": { "code": "ERROR_CODE", "message": "Descripción legible" } }
```

### 7.1 Proyectos — `/api/proyectos`

#### `GET /api/proyectos`
- Retorna todos los proyectos ordenados por `created_at DESC`
- Incluye count de UFs por proyecto (join con `unidades_funcionales`)

#### `POST /api/proyectos`
- Body: `{ nombre: string }`
- Validación: nombre no vacío, máx 200 caracteres
- Error si nombre duplicado: `DUPLICATE_KEY`

#### `GET /api/proyectos/[id]`
- Retorna proyecto por id
- Error si no existe: `NOT_FOUND`

#### `PUT /api/proyectos/[id]`
- Body: `{ nombre: string }`
- Mismas validaciones que POST

#### `DELETE /api/proyectos/[id]`
- **Verificar antes de borrar:**
  - Si tiene `unidades_funcionales` asociadas → error `HAS_DEPENDENTS`
  - Mensaje: `"Este proyecto tiene X unidades funcionales. Elimínalas primero."`
- Si no tiene dependientes → eliminar

### 7.2 Unidades Funcionales — `/api/unidades-funcionales`

#### `GET /api/unidades-funcionales`
- Query param: `?proyecto_id=<uuid>` (requerido)
- Retorna UFs del proyecto indicado, ordenadas por `created_at ASC`

#### `POST /api/unidades-funcionales`
- Body: `{ nombre, proyecto_id }`
- Verificar que `proyecto_id` existe
- Nombre único dentro del mismo proyecto

#### `PUT /api/unidades-funcionales/[id]`
- Body: `{ nombre }`

#### `DELETE /api/unidades-funcionales/[id]`
- **Verificar:** si tiene `rutas` → error `HAS_DEPENDENTS`
  - Mensaje: `"Esta UF tiene X rutas asociadas. Elimínalas primero."`

### 7.3 Configuración Tags — `/api/configuracion-tags`

#### `GET /api/configuracion-tags`
- Retorna todos los tags ordenados por `tag ASC`

#### `POST /api/configuracion-tags`
- Body: `{ tag, descripcion, tipo }`
- `tag` se guarda en UPPERCASE
- Validar que `tipo` sea `bifurcado` o `unico`
- Error `DUPLICATE_KEY` si el tag ya existe

#### `PUT /api/configuracion-tags/[id]`
- Body: `{ tag?, descripcion?, tipo? }`

#### `DELETE /api/configuracion-tags/[id]`
- **Verificar:** si alguna `ruta.carriles_tags` contiene este tag → error `HAS_DEPENDENTS`
  - Query: `SELECT COUNT(*) FROM rutas WHERE $1 = ANY(carriles_tags)`
  - Mensaje: `"El tag '<TAG>' está en uso en X rutas. Elimínalo de las rutas primero."`

### 7.4 Rutas — `/api/rutas`

#### `GET /api/rutas`
- Query param: `?unidad_funcional_id=<uuid>` (requerido)
- Retorna rutas de la UF indicada

#### `POST /api/rutas`
- Body: `{ nombre, unidad_funcional_id, carriles_tags: string[] }`
- Verificar que `unidad_funcional_id` existe
- Verificar que cada tag en `carriles_tags` existe en `configuracion_tags`
- Validar coherencia de tags: no mezclar `bifurcado` y `unico` en la misma ruta

#### `POST /api/rutas/batch`
- Body: `{ unidad_funcional_id, rutas: Array<{ id?, nombre, carriles_tags }> }`
- Reemplaza todas las rutas de la UF (upsert):
  - Rutas existentes (con id): actualizar
  - Rutas nuevas (sin id): insertar
  - Rutas eliminadas (presentes en DB pero no en payload): verificar que no tengan mediciones antes de eliminar

#### `PUT /api/rutas/[id]`
- Body: `{ nombre?, carriles_tags? }`

#### `DELETE /api/rutas/[id]`
- **Verificar:** si tiene `mediciones` → error `HAS_DEPENDENTS`
  - Mensaje: `"Esta ruta tiene X mediciones registradas. Elimínalas primero."`

### 7.5 Indicadores — `/api/indicadores`

#### `GET /api/indicadores`
- Retorna todos los indicadores ordenados por `identificador ASC`

#### `POST /api/indicadores`
- Body: `CreateIndicadorDTO`
- `frecuencia_dias` se calcula automáticamente desde `FRECUENCIAS[frecuencia].dias`
- Validar que `identificador` sea único (case-insensitive)
- Validar que `condiciones` tenga al menos 1 elemento
- Cada condición debe tener: `nombre`, `operador`, `valor`, `tipo`, `unidad`
- Si `operador === 'between'` → `valor_max` es requerido y debe ser `> valor`

#### `PUT /api/indicadores/[id]`
- Mismas validaciones que POST excepto unique check (excluir el propio registro)

#### `DELETE /api/indicadores/[id]`
- **Verificar:** si tiene `mediciones` → error `HAS_DEPENDENTS`
  - Mensaje: `"Este indicador tiene X mediciones registradas. Elimínalo de las mediciones primero."`

### 7.6 Mediciones — `/api/mediciones`

#### `GET /api/mediciones`
- Query params opcionales: `?proyecto_id=`, `?ruta_id=`, `?indicador_id=`
- Retorna mediciones con joins de nombre de ruta e identificador de indicador
- Ordenar por `fecha DESC, created_at DESC`

#### `POST /api/mediciones`
- Body: `CreateMedicionDTO`
- Verificar que `proyecto_id`, `unidad_funcional_id`, `ruta_id`, `indicador_id` existen
- Validar que `fecha` no sea futura
- Validar que `carriles_seleccionados` no esté vacío
- Validar que cada carril en `carriles_seleccionados` esté en `ruta.carriles_tags`
- Guardar `datos` (compacto) en `mediciones.datos`
- Si `registros_base` viene en el body (array):
  - Insertar en `mediciones_registros_base` en batch
  - Actualizar `tiene_datos_base = true`
- Retornar la medición creada

#### `GET /api/mediciones/[id]`
- Retorna medición completa
- No incluye `registros_base` por defecto

#### `GET /api/mediciones/[id]/registros-base`
- Retorna los registros base de la medición paginados o completos
- Query param: `?pagina=1&por_pagina=500` (opcional)

#### `DELETE /api/mediciones/[id]`
- Eliminar `mediciones_registros_base` donde `medicion_id = id`
- Luego eliminar la medición
- No tiene dependientes → siempre se puede borrar

---

## 8. CUSTOM HOOKS — `src/hooks/`

Cada hook encapsula las llamadas al API con estado de carga y error.

### Patrón estándar
```typescript
// useProyectos.ts — ejemplo representativo
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Proyecto, CreateProyectoDTO } from '@/types';

export function useProyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/proyectos');
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setProyectos(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const crear  = async (dto: CreateProyectoDTO)  => { /* POST + refetch */ };
  const editar = async (id: string, dto: Partial<CreateProyectoDTO>) => { /* PUT + refetch */ };
  const borrar = async (id: string) => { /* DELETE + refetch, lanzar error con mensaje del server */ };

  return { proyectos, isLoading, error, crear, editar, borrar, refetch: fetch };
}
```

Implementar el mismo patrón para:
- `useUnidadesFuncionales(proyectoId: string)`
- `useConfigTags()`
- `useRutas(ufId: string)`
- `useIndicadores()`
- `useMediciones(filtros?: { proyectoId?, rutaId?, indicadorId? })`

---

## 9. COMPONENTES COMPARTIDOS — `src/components/shared/`

### 9.1 `InlineEdit.tsx`
- Texto clicable que se convierte en input al hacer click
- `onSave(valor: string)` se llama al presionar Enter o el botón de confirmar
- No llama `onSave` si el valor está vacío (restaurar valor original)
- Props: `value: string`, `onSave: (val: string) => void`, `disabled?: boolean`

### 9.2 `TagMultiSelect.tsx`
- Muestra los tags disponibles como chips seleccionables
- Props: `value: string[]`, `onChange: (val: string[]) => void`, `options: ConfiguracionTag[]`, `disabled?: boolean`
- Regla de exclusión mutua:
  - Si se selecciona un tag `bifurcado`, deshabilitar todos los `unico` y viceversa
  - Si el nuevo tag es `bifurcado` y hay tags `unico` seleccionados → removerlos automáticamente
- Tags seleccionados: fondo `#FFF3CD`, borde `#FFE69C`, texto `#664D03`
- Tags no seleccionados: fondo slate-50

### 9.3 `SlidePanel.tsx`
- Panel lateral deslizable desde la derecha
- Props: `isOpen`, `onClose`, `title`, `children`, `width?: string`
- Backdrop semi-transparente al abrirse
- Transición CSS `transform duration-300`

### 9.4 `ConfirmDeleteDialog.tsx`
- Usa `AlertDialog` de shadcn
- Props: `isOpen`, `onClose`, `onConfirm`, `title`, `message`
- Botón de confirmación en variante `destructive`

### 9.5 `InfoBanner.tsx`
- Banner azul informativo con ícono `Info`
- Props: `title: string`, `children: ReactNode`
- Usar en cada página para contextualizar el módulo

### 9.6 `PageHeader.tsx`
- Props: `title`, `subtitle?`, `action?: ReactNode`
- Renderiza el encabezado estándar de cada página

### 9.7 `EmptyState.tsx`
- Props: `icon: LucideIcon`, `title`, `description?`, `action?: ReactNode`

---

## 10. LAYOUT Y SIDEBAR — `src/components/layout/`

### `Sidebar.tsx`
```
Sidebar fijo izquierdo (w-64) con fondo #0A1628

Logo:
  [AQ] AQUA-Infra

Sección "Principal":
  📁 Proyectos          → /proyectos
  🗺 Unidades & Rutas   → /rutas
  ☰  Plantillas Carriles → /carriles
  📈 Indicadores        → /indicadores

Sección "Operación Core":
  📋 Mediciones         → /mediciones

SidebarItem activo: bg-[#1B3A6B] + border-r-4 border-[#00C2D4]
Icono activo: color #00C2D4
```

### `AppHeader.tsx`
- Barra superior `h-16` con fondo blanco
- Botón hamburguesa visible solo en mobile (`lg:hidden`)
- Espacio para breadcrumb o contexto activo (implementar luego)

### `src/app/layout.tsx`
```tsx
// Importar fuentes con next/font
import { Syne } from 'next/font/google';   // headings
import { DM_Sans } from 'next/font/google'; // body

// Envolver en Sidebar + main area + Toaster (sonner)
```

---

## 11. PÁGINAS Y MÓDULOS

### 11.1 `/proyectos` — Módulo Proyectos

**Funcionalidad:**
- Listar proyectos en tabla: columnas ID, Nombre, Nro. UFs, Acciones
- Añadir nuevo proyecto: input inline en la parte superior + botón "Añadir"
- Editar nombre: `InlineEdit` en la celda de nombre
- Eliminar: `ConfirmDeleteDialog` → si tiene UFs mostrar error toast con mensaje del servidor
- Botón "Entrar": navega a `/rutas?proyecto_id=<id>` y guarda el proyecto activo en estado local (Context o URL)

**Errores a manejar:**
- Nombre vacío al crear: mostrar error inline
- Nombre duplicado: toast de error con mensaje del servidor
- Proyecto con UFs al eliminar: toast de error `"No se puede eliminar: tiene X unidades funcionales"`

---

### 11.2 `/rutas` — Módulo Unidades Funcionales & Rutas

**Layout:** Panel principal (tabla de UFs) + `SlidePanel` derecho (rutas de la UF activa)

**UFs:**
- Si no hay proyecto activo en la URL → mostrar `EmptyState` con botón para ir a proyectos
- Listar UFs del proyecto activo
- Añadir nueva UF: input + botón "Añadir UF"
- Editar nombre: `InlineEdit`
- Eliminar: verificar dependientes → toast error si tiene rutas
- Botón "Rutas": abre `SlidePanel` con las rutas de esa UF

**Rutas (dentro del SlidePanel):**
- Input + "Añadir" para agregar rutas localmente (sin guardar aún)
- Columna "Carril": `TagMultiSelect` con los tags disponibles de `configuracion_tags`
- Columna "Opciones": botón eliminar fila
- Botón "Guardar Todo" (sticky en la parte inferior del panel): llama a `POST /api/rutas/batch`
- Al guardar, cerrar el panel y mostrar toast de éxito
- Al abrir el panel para una UF, cargar las rutas existentes de `GET /api/rutas?unidad_funcional_id=<id>`

**Errores:**
- UF sin nombre: validación inline
- Ruta sin carriles: mostrar advertencia visual (badge amarillo) pero permitir guardar
- Error en batch save: toast de error con mensaje del servidor

---

### 11.3 `/carriles` — Plantillas de Carriles

**Funcionalidad:**
- Tabla: Tag | Descripción | Tipo | Acciones
- Formulario en la parte superior para añadir nuevo tag
- `InlineEdit` para editar tag y descripción directamente en la tabla
- Select para cambiar tipo
- Eliminar: si está en uso en rutas → error toast con mensaje del servidor

**Datos semilla precargados** (de la migración SQL): DD, DI, ID, II, D, I

**Errores:**
- Tag duplicado: `"El acrónimo 'XX' ya existe"`
- Tag vacío: validación de formulario
- Tag en uso al eliminar: `"El tag 'XX' está usado en X rutas. Quítalo de las rutas primero."`

---

### 11.4 `/indicadores` — Módulo Indicadores

**Lista:** Vista tabla / vista tarjetas (toggle)
- Buscador en tiempo real por nombre o identificador
- Columnas tabla: ID | Nombre | Frecuencia | # Condiciones | Acciones
- Acciones: ver detalle (Eye), editar (Edit), eliminar (Trash)

**IndicadorForm (SlidePanel ancho 680px):**

Sección 1 — Identificación:
- `nombre` (input, requerido)
- `identificador` (input, requerido, auto-uppercase)
- `concepto_medicion` (textarea 3 filas)
- `normatividad` (textarea 3 filas)
- `metodo_medida` (textarea 5 filas)

Sección 2 — Parámetros:
- `frecuencia` (select con FRECUENCIAS)
- Badge informativo: `"Equivale a X días — se generará alerta cada X días"`
- `unidad_medida` (input)

Sección 3 — Tiempo de corrección:
- Input número (`null` si N/A) + Select `N/A | HORAS | MESES`
- Si N/A → deshabilitar y limpiar input número

Sección 4 — Condiciones de aceptación:
- Tabla editable (ver prototipo)
- Botón "+ Agregar Condición" abre fila de edición inline
- Cada condición: nombre, tipo (PUNTUAL/MEDIO/GENERAL), operador, valor, (valor_max si between), unidad
- Al confirmar: agregar al array local
- Mínimo 1 condición requerida

**IndicadorDetalle (SlidePanel ancho 720px, solo lectura):**
- Header con nombre grande + badge identificador + badge frecuencia
- Sección condiciones con cards visuales

**Errores:**
- Identificador duplicado al crear/editar
- Sin condiciones
- Si `between`: `valor_max` requerido y debe ser `> valor`
- Indicador con mediciones al eliminar: error toast

---

### 11.5 `/mediciones` — Listado de Mediciones

**Lista:**
- Tabla: Fecha | Ruta | Carril(es) | Indicador | Estado | Acciones
- Estado: badge verde `CUMPLE` / rojo `INCUMPLE`
- Acciones: Ver gráfica (Eye → `/mediciones/[id]`), Eliminar (Trash)
- Filtros opcionales en la parte superior: Proyecto, Indicador (selects)
- Botón "+ Cargar Medición" → navega a `/mediciones/nueva`

---

### 11.6 `/mediciones/nueva` — Wizard de Nueva Medición

**Barra de progreso:** 4 pasos con línea de progreso animada

**Paso 1 — Contexto:**
- Select Proyecto → carga UFs
- Select UF (dependiente de Proyecto)
- Select Ruta (dependiente de UF)
- Select Indicador
- DatePicker (input type="date", no futuras)
- Mostrar si existe medición previa para esa ruta+indicador: `"Última medición: [fecha] (hace X días)"` + badge rojo si está vencida
- Siguiente activo solo si todos los campos tienen valor

**Paso 2 — Carriles:**
- Mostrar los `carriles_tags` de la ruta seleccionada como tarjetas seleccionables
- Cada tarjeta: tag grande + descripción del catálogo
- Estado visual: no-seleccionado / seleccionado (borde cian + check)
- Mínimo 1 carril debe estar seleccionado

**Paso 3 — Carga de Datos:**
- Texto informativo: `"El archivo debe tener 5 columnas. Sin RUTA ni promedios precalculados."`
- Botón "Descargar plantilla" → `descargarPlantillaIRI()`
- Drop zone con `input type="file" accept=".csv"`
- Al cargar: mostrar spinner "Procesando..."
- Llamar a `parsearArchivoIRI()` con los límites del indicador seleccionado
- Si error de parseo: mostrar banner rojo con el mensaje exacto del error
- Si éxito: mostrar preview con estadísticas (total registros, rango, resumen de cumplimiento)
- Botón "Subir otro archivo" para resetear

**Paso 4 — Confirmación:**
- Tarjeta resumen: Ruta, UF, Indicador, Fecha, Carriles, # Registros, Estado Global
- Botón "GUARDAR":
  - Crear una `Medicion` por cada carril seleccionado (mismo archivo, cada carril es registro independiente)
  - Enviar `registros_base` al endpoint para guardado en DB
  - Redirigir a `/mediciones`

---

### 11.7 `/mediciones/[id]` — Detalle y Gráficas

Esta es la página más compleja. Ver el componente `MedicionDetalleView` del prototipo como referencia exacta.

**Breadcrumb:** Mediciones → Proyecto → UF → Ruta

**Header:** Nombre indicador + carril + badge fecha + badge estado global

**4 cards de estadísticas:**
- Valor máx. puntual vs límite PUNTUAL
- Valor medio global vs límite MEDIO
- % Cumplimiento
- Cantidad de puntos fuera del límite

**Selector de tramos (mediciones del mismo carril/indicador/ruta):**
- Chips clicables por fecha de medición
- Al seleccionar múltiples: las gráficas superponen los datos
- Fechas duplicadas: mostrar `"YYYY-MM-DD (Tramo 2)"`
- Cada año tiene un par de colores `(izq, der)` constante (ver `COLOR_PAIRS` del prototipo)

**Toggle:** `Puntual (100m)` / `Crudo (Xm)`

**Gráfica principal (ComposedChart, Recharts):**
- Eje X: abscisa formateada `K2+080`
- Eje Y: valor IRI con escala "limpia" (`getNiceMax`)
- Zona roja semitransparente sobre el límite PUNTUAL (`ReferenceArea`)
- Línea de límite punteada roja con label `"Límite X.X"`
- Una `Line` por tramo seleccionado, coloreada por año
- Puntos rojos donde el valor supera el límite (`CustomDot`)
- `Brush` para zoom horizontal
- Botón "Pantalla Completa" → `position: fixed` sobre toda la pantalla
- Tooltip personalizado con abscisa y valor por tramo

**Gráfica de barras por km (BarChart, Recharts):**
- Una barra por km con color verde (cumple) / rojo (incumple)
- Línea amarilla de referencia al límite MEDIO
- `Brush` para navegación
- **Al hacer click en una barra** → hace zoom en la gráfica principal (actualiza `Brush` de la gráfica de línea)
- Botón "Expandir" para pantalla completa

**Tabla de detalle por km:**
- Columnas: Km | Valor Medio | # Incumplimientos | Estado
- Filas incumplidoras con fondo rojo tenue
- Contador en el header: `"X km incumplen / Y total"`
- Scrollable, máx. 300px de altura

---

## 12. LÓGICA DE ELIMINACIÓN PROTEGIDA — RESUMEN

| Entidad | Bloquea si tiene... | Mensaje de error |
|---|---|---|
| Proyecto | UFs | `"Este proyecto tiene X unidades funcionales. Elimínalas primero."` |
| UnidadFuncional | Rutas | `"Esta UF tiene X rutas. Elimínalas primero."` |
| ConfiguracionTag | Rutas que usan el tag | `"El tag 'XX' está en uso en X rutas."` |
| Ruta | Mediciones | `"Esta ruta tiene X mediciones. Elimínalas primero."` |
| Indicador | Mediciones | `"Este indicador tiene X mediciones. Elimínalas primero."` |
| Medicion | — | Siempre se puede eliminar (elimina también sus registros_base) |

**Implementación en API:**
```typescript
// Ejemplo en DELETE /api/proyectos/[id]
const { count } = await supabaseAdmin
  .from('unidades_funcionales')
  .select('*', { count: 'exact', head: true })
  .eq('proyecto_id', id);

if (count && count > 0) {
  return Response.json({
    data: null,
    error: {
      code: ERROR_CODES.HAS_DEPENDENTS,
      message: `Este proyecto tiene ${count} unidades funcionales. Elimínalas primero.`
    }
  }, { status: 409 });
}
```

---

## 13. MANEJO DE ERRORES EN EL FRONTEND

### Toast de error estándar (usando `sonner`)
```typescript
// En los hooks, al recibir error del API:
import { toast } from 'sonner';

// Éxito:
toast.success('Proyecto creado correctamente');

// Error de negocio (HAS_DEPENDENTS, DUPLICATE_KEY):
toast.error(json.error.message); // Mostrar el mensaje exacto del servidor

// Error interno:
toast.error('Error inesperado. Intenta de nuevo.');
```

### Reglas de manejo:
- Errores `4xx` con `code: HAS_DEPENDENTS` → toast rojo con mensaje del servidor (descriptivo)
- Errores `4xx` con `code: DUPLICATE_KEY` → toast rojo con mensaje del servidor
- Errores `4xx` con `code: VALIDATION_ERROR` → toast rojo, idealmente mostrar en el formulario
- Errores `5xx` → toast rojo genérico
- Error de red (fetch falla) → toast rojo `"Sin conexión con el servidor"`

---

## 14. ESTILO VISUAL Y TOKENS

### Variables CSS globales
```css
:root {
  --color-dark: #0A1628;
  --color-blue: #1B3A6B;
  --color-cyan: #00C2D4;
  --color-bg:   #F8FAFC;
}
```

### Fuentes
- **Headings:** `Syne` (weights: 400, 600, 700, 800) → clase `font-heading`
- **Body:** `DM Sans` (opsz 9..40, weights: 400, 500, 700) → clase `font-body`
- Configurar en `tailwind.config.ts` como `fontFamily.heading` y `fontFamily.body`

### Paleta de colores Tailwind custom
```typescript
// tailwind.config.ts
extend: {
  colors: {
    brand: {
      dark: '#0A1628',
      blue: '#1B3A6B',
      cyan: '#00C2D4',
    }
  },
  fontFamily: {
    heading: ['var(--font-syne)', 'sans-serif'],
    body:    ['var(--font-dm-sans)', 'sans-serif'],
  }
}
```

### Scrollbar personalizada
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
```

---

## 15. VARIABLES DE ENTORNO — `.env.local`

```env
# Supabase local (valores del output de `pnpm supabase start`)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 16. ORDEN DE IMPLEMENTACIÓN PARA EL AGENTE

Seguir este orden estrictamente. No avanzar al siguiente bloque hasta que el anterior compile sin errores TypeScript.

```
BLOQUE 1 — Base del proyecto
  1. Setup Next.js + shadcn + dependencias (ver sección 1)
  2. src/types/index.ts (completo)
  3. src/lib/supabase/client.ts y server.ts
  4. src/lib/utils/formatters.ts
  5. src/lib/utils/colorPairs.ts
  6. src/lib/utils/chartHelpers.ts
  7. src/lib/parsers/iriParser.ts (trasladar del prototipo)
  8. src/lib/utils/templateDownload.ts
  9. src/lib/validators/indicadorValidator.ts
  10. supabase/migrations/001_initial_schema.sql → ejecutar

BLOQUE 2 — Layout y componentes compartidos
  11. src/app/layout.tsx (fuentes, Sidebar, Toaster)
  12. src/components/layout/Sidebar.tsx + SidebarItem.tsx + AppHeader.tsx
  13. src/components/shared/InlineEdit.tsx
  14. src/components/shared/TagMultiSelect.tsx
  15. src/components/shared/SlidePanel.tsx
  16. src/components/shared/ConfirmDeleteDialog.tsx
  17. src/components/shared/InfoBanner.tsx + PageHeader.tsx + EmptyState.tsx

BLOQUE 3 — API Routes
  18. /api/proyectos (GET, POST)
  19. /api/proyectos/[id] (GET, PUT, DELETE)
  20. /api/unidades-funcionales (GET, POST)
  21. /api/unidades-funcionales/[id] (PUT, DELETE)
  22. /api/configuracion-tags (GET, POST)
  23. /api/configuracion-tags/[id] (PUT, DELETE)
  24. /api/rutas (GET, POST)
  25. /api/rutas/batch (POST)
  26. /api/rutas/[id] (PUT, DELETE)
  27. /api/indicadores (GET, POST)
  28. /api/indicadores/[id] (GET, PUT, DELETE)
  29. /api/mediciones (GET, POST)
  30. /api/mediciones/[id] (GET, DELETE)
  31. /api/mediciones/[id]/registros-base (GET)

BLOQUE 4 — Hooks
  32. src/hooks/useProyectos.ts
  33. src/hooks/useUnidadesFuncionales.ts
  34. src/hooks/useConfigTags.ts
  35. src/hooks/useRutas.ts
  36. src/hooks/useIndicadores.ts
  37. src/hooks/useMediciones.ts

BLOQUE 5 — Módulos de páginas (uno a uno)
  38. /proyectos → page.tsx + ProyectoForm.tsx
  39. /carriles  → page.tsx + ConfigTagForm.tsx
  40. /rutas     → page.tsx + UFTable.tsx + RutasPanel.tsx + RutaRow.tsx
  41. /indicadores → page.tsx + IndicadorForm.tsx + IndicadorDetalle.tsx + CondicionesEditor.tsx
  42. /mediciones → page.tsx (listado)
  43. /mediciones/nueva → page.tsx + todos los componentes del wizard
  44. /mediciones/[id] → page.tsx + GraficaIRI.tsx + GraficaBarrasKm.tsx + TablaResumenKm.tsx + EstadisticasCards.tsx
```

---

## 17. NOTAS TÉCNICAS CRÍTICAS

### Parser CSV
- El separador del archivo se detecta automáticamente (`,`, `;`, `\t`)
- Las abscisas `PR02+080` se convierten a metros: `2*1000 + 80 = 2080`
- Los decimales pueden venir con coma (`2,24`) → reemplazar por punto antes de `parseFloat`
- Si el archivo tiene más de 5 columnas (ej. columnas de promedios ya calculados), **ignorarlas**
- Si no se encuentran datos válidos → lanzar `Error` con mensaje descriptivo

### Gráficas multi-tramo
- Cada medición se identifica por su `id` como `dataKey` en Recharts
- En el tooltip, mostrar la fecha de la medición como label (no el id)
- `connectNulls={false}` para no dibujar líneas entre tramos con abscisas distintas
- Al abrir la página `/mediciones/[id]`: preseleccionar solo esa medición. El usuario activa otras manualmente

### Guardado de mediciones_registros_base
- El body del `POST /api/mediciones` puede ser grande (3000+ registros)
- Insertar en batch usando `supabaseAdmin.from('mediciones_registros_base').insert(registros_base.map(r => ({ medicion_id: id, ...r })))`
- Si el insert de registros_base falla → hacer rollback eliminando la medición creada (transacción manual)

### Eliminación de medición
- Primero `DELETE FROM mediciones_registros_base WHERE medicion_id = $1`
- Luego `DELETE FROM mediciones WHERE id = $1`
- Retornar éxito solo si ambos pasos se completaron

### Performance de gráficas
- Vista 100m: máx ~666 puntos por medición → Recharts lo maneja sin problemas
- Vista 20m (crudo): puede llegar a 3333 puntos → usar `Brush` con rango inicial acotado
- Nunca cargar registros_base en el estado global; cargarlos on-demand al cambiar a vista 20m

---

## 18. REFERENCIA RÁPIDA DE COLORES DE GRÁFICAS

```typescript
// src/lib/utils/colorPairs.ts
export const COLOR_PAIRS = [
  { izq: '#60a5fa', der: '#1d4ed8' }, // azul
  { izq: '#fb923c', der: '#c2410c' }, // naranja
  { izq: '#4ade80', der: '#14532d' }, // verde
  { izq: '#c084fc', der: '#6b21a8' }, // púrpura
  { izq: '#f472b6', der: '#be185d' }, // rosa
  { izq: '#facc15', der: '#a16207' }, // amarillo
];

// Color del límite: rojo #ef4444
// ReferenceArea (zona sobre límite): fill="#fee2e2" fillOpacity=0.4
// Línea límite puntual: roja punteada, label "Límite X.X"
// Línea límite medio: ámbar #f59e0b punteada (en gráfica de barras)
// Barra cumple: #10b981 (verde)
// Barra incumple: #ef4444 (rojo)
// Brush: stroke #00C2D4
```

---

*Fin del documento de especificación.*
*El agente debe leer este documento completo antes de escribir cualquier archivo.*
*Ante cualquier ambigüedad, referirse al prototipo `.tsx` adjunto como fuente de verdad de la lógica de negocio.*
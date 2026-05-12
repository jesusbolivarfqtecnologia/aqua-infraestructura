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
  km_label:          string;
  from_m:            number;
  to_m:              number;
  valor_medio:       number;
  n_puntuales:       number;
  n_incumplimientos: number;
  cumple_medio:      boolean;
  cumple_km:         boolean;
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
  tipo:                'IRI';
  version:             '1.0';
  unidad:              string;
  intervalo_base_m:    number;
  intervalo_puntual_m: number;
  registros_puntual:   IRI_RegistroPuntual[];
  resumen_km:          IRI_ResumenKm[];
  estadisticas:        IRI_Estadisticas;
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

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
  -- Un registro por medicion con estructura variable
  headers      JSONB NOT NULL DEFAULT '[]'::jsonb,
  data         JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Índice para consultas rápidas por medición
CREATE UNIQUE INDEX idx_mediciones_registros_base_medicion
  ON mediciones_registros_base(medicion_id);

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

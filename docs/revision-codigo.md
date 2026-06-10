# Revision de codigo

Objetivo: revisar carpeta por carpeta, documentar mejoras y buenas practicas para Next, React y Supabase.

## src/app/mediciones/nueva/page.tsx

Resumen rapido: pagina cliente con wizard para cargar CSV de IRI, seleccionar carriles y guardar mediciones.

Mejoras sugeridas:
- Manejo de errores de red: validar `res.ok` en cada `fetch` y mostrar mensaje especifico si falla.
- Tipado: reemplazar `any` en `parsedData` y `err` por tipos dedicados (por ejemplo `ParsedIriData`).
- Efectos: proteger `setState` tras unmount usando `AbortController` o flag `isMounted` en `fetch`.
- Efectos: evitar warnings de `exhaustive-deps` moviendo fetchers fuera del componente o usando `useCallback`.
- Guardado: evitar `for await` secuencial si se puede enviar en batch o con `Promise.all`, y manejar fallos parciales con detalle.
- Estado y re-renders: extraer handlers y consultas a hooks (ej. `useMedicionesWizard`) para separar UI de data.
- UX: agregar estados de carga para listas iniciales (proyectos, rutas, tags) y deshabilitar pasos si faltan datos.
- Fecha maxima: `toISOString()` usa UTC; para inputs date conviene fecha local para evitar desfase.

Notas:
- Verificar si el API permite guardar multiples carriles en una sola solicitud para reducir latencia.
- Validar que el wizard indique correctamente errores de archivo y de guardado.

## src/components/mediciones/wizard/StepContexto.tsx

Resumen rapido: paso de contexto con selects de proyecto/UF/ruta/indicador y fecha, mas aviso de ultima medicion.

Mejoras sugeridas:
- Accesibilidad: asociar `label` con `htmlFor` + `id` en `Select`/`Input`, y considerar `aria-describedby` para el aviso.
- Responsivo: ajustar `grid grid-cols-2` a `grid-cols-1 sm:grid-cols-2` para pantallas pequenas.
- Estados vacios: si `ufs`, `rutas` o `indicadores` estan vacios, mostrar texto de ayuda y deshabilitar el `Select`.
- Actualizacion de `form`: preferir setter funcional para evitar valores stale cuando se encadenan cambios.
- Boton: definir `type="button"` en `Button` para evitar submits implicitos si se envuelve en un `form`.

Notas:
- Confirmar si `Select` y `Input` ya inyectan `id` o props accesibles para no duplicar.

## src/components/mediciones/wizard/StepCargaDatos.tsx

Resumen rapido: paso de carga de CSV, validacion de archivo y resumen de estadisticas del parseo.

Mejoras sugeridas:
- Tipado: reemplazar `registrosBase: any[]` por tipo concreto (por ejemplo `RegistroBase[]`).
- Accesibilidad: agregar `aria-label` o texto visible al area de carga; el input es invisible.
- UX: mostrar nombre de archivo seleccionado y permitir reintento sin recargar el paso.
- Estados: deshabilitar el boton Siguiente mientras `isProcessing` para evitar avanzar sin data estable.
- Mensajes: extraer copy a constantes para facilitar i18n y evitar duplicacion.

Notas:
- Confirmar si el CSV exige encoding especifico y agregar validacion si aplica.

## src/components/mediciones/wizard/StepCarriles.tsx

Resumen rapido: paso de seleccion de carriles con tarjetas clicables y estado seleccionado.

Mejoras sugeridas:
- Accesibilidad: reemplazar `div` clicable por `button` o `label`+`input` para soporte de teclado y lectores de pantalla.
- Accesibilidad: exponer `aria-pressed`/`aria-selected` y `tabIndex` si se mantiene el contenedor clickable.
- Responsivo: ajustar `grid grid-cols-2` a `grid-cols-1 sm:grid-cols-2` para pantallas pequenas.
- Estados vacios: si `carriles` esta vacio, mostrar mensaje y deshabilitar boton Siguiente.
- Botones: definir `type="button"` para evitar submits implicitos si el paso se usa dentro de un `form`.

Notas:
- Evaluar si se requiere seleccion multiple por defecto o limite de seleccion.

## src/components/mediciones/wizard/StepConfirmacion.tsx

Resumen rapido: resumen final de la medicion con estado global y confirmacion de guardado.

Mejoras sugeridas:
- Tipado: reemplazar `registrosBase: any[]` por tipo concreto para evitar perdida de informacion.
- Responsivo: ajustar `grid grid-cols-2` a `grid-cols-1 sm:grid-cols-2` para pantallas pequenas.
- UX: agregar estado de guardado/deshabilitar boton Guardar para evitar doble submit.
- Accesibilidad: usar `aria-live` para el estado global si se actualiza dinamicamente.
- Botones: definir `type="button"` para evitar submits implicitos si el paso se usa dentro de un `form`.

Notas:
- Considerar mostrar un resumen compactado si hay muchos carriles (por ejemplo, truncar y mostrar count).

## src/components/mediciones/wizard/WizardProgress.tsx

Resumen rapido: barra de progreso con 4 pasos y linea de avance dinamica.

Mejoras sugeridas:
- Accesibilidad: agregar texto oculto con el paso actual (ej. `aria-current="step"` o `aria-label`).
- Responsivo: reducir tamanos o espaciado en pantallas pequenas para evitar overflow.
- Robustez: validar rango de `step` (1-4) o clamping para evitar widths negativas o >100%.
- Reusabilidad: extraer el total de pasos a una constante/prop para evitar hardcode.

Notas:
- Revisar si el `-z-10` afecta stacking en layouts con backgrounds complejos.

## src/components/mediciones/wizard/index.ts

Resumen rapido: archivo barrel que exporta los componentes del wizard.

Mejoras sugeridas:
- Consistencia: mantener el orden alfabetico en exports o agrupar por flujo (pasos 1-4).
- Lint: si el proyecto usa `eslint-plugin-import`, asegurar reglas de orden y evitar ciclos.

Notas:
- Sin cambios funcionales; solo organizacion.

## src/components/mediciones/EstadisticasCards.tsx

Resumen rapido: tarjetas de estadisticas de IRI con estado OK/No OK.

Mejoras sugeridas:
- Keys: evitar usar indice como key; usar `label` u otro identificador estable.
- Accesibilidad: no depender solo del color para indicar estado; agregar texto/icono visible.
- Responsivo: ajustar `grid grid-cols-2` a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` si se satura en mobile.
- Formato: usar formateadores (ej. `Intl.NumberFormat`) para consistencia y locales en lugar de `toFixed`.
- Performance: opcionalmente memoizar `cards` con `useMemo` si el componente se renderiza con mucha frecuencia.

Notas:
- Confirmar si `viewMode` necesita labels mas claros para usuarios no tecnicos.

## src/components/mediciones/GraficaBarrasKm.tsx

Resumen rapido: grafica de barras por km con tooltip, brush y modo fullscreen.

Mejoras sugeridas:
- Tipado: evitar `any` en `handleBarClick` y `formatter`; crear tipos de tooltip y payload.
- Accesibilidad: agregar texto alterno o resumen de datos para usuarios sin grafica (aria-describedby).
- UX: deshabilitar el boton de fullscreen cuando no hay data/series.
- Rendimiento: memoizar `formatValue` y `handleBarClick` con `useCallback` si el componente re-renderiza mucho.
- Limpieza: extraer strings a constantes y normalizar copy (acentos: grafica/grafica).

Notas:
- Confirmar si el `Brush` es requerido en mobile; podria ocultarse para pantallas pequenas.

## src/components/mediciones/GraficaIRI.tsx

Resumen rapido: grafica de lineas para IRI (100m/20m) con filtros, brush y modo fullscreen.

Mejoras sugeridas:
- Tipado: eliminar `any` en dots, tooltip y brush handler; definir tipos locales para props.
- Accesibilidad: botones de toggle con `aria-pressed` y etiquetas descriptivas.
- UX: deshabilitar botones de vista cuando no hay `selectedMedIds` para evitar confusion.
- Rendimiento: memoizar filtros `medicionesConLabel.filter(...)` y `dense` flags si cambian poco.
- Consistencia: extraer strings y labels ("Perfil de Medicion", "Nota tecnica") a constantes para i18n.

Notas:
- Revisar si `requestAnimationFrame` del brush puede duplicarse en modo React Strict (doble mount).

## src/components/mediciones/TablaResumenKm.tsx

Resumen rapido: tabla de resumen por km con incumplimientos y detalle clicable.

Mejoras sugeridas:
- Keys: evitar usar indice como key; usar `km_label` u otro identificador estable.
- Accesibilidad: agregar `scope="col"` en `th` y `aria-label` para la tabla si es necesario.
- UX: deshabilitar clic en filas si `onRowClick` no aplica o si `data` esta vacio.
- Formato: usar `Intl.NumberFormat` para valores y mantener consistencia con otras vistas.
- Responsive: agregar contenedor con `overflow-x-auto` si el contenido se corta en pantallas pequenas.

Notas:
- Confirmar si el calculo de "km incumplen" debe considerar filtros activos.

## src/components/mediciones/index.ts

Resumen rapido: archivo barrel que exporta componentes del modulo de mediciones.

Mejoras sugeridas:
- Consistencia: mantener orden alfabetico en exports o agrupar por vistas (graficas, tablas, cards).
- Lint: aplicar reglas de orden si se usa `eslint-plugin-import` para evitar ciclos.

Notas:
- Sin cambios funcionales; solo organizacion.

## src/components/indicadores/CondicionesEditor.tsx

Resumen rapido: editor de condiciones con tabla y fila de alta inline.

Mejoras sugeridas:
- IDs: evitar `Math.random` para ids; usar `crypto.randomUUID()` o id del backend.
- Accesibilidad: agregar `type="button"` en botones y `aria-label` para borrar/confirmar.
- Validacion: bloquear agregar si `valor` es NaN o si operador `between` no tiene `valor_max`.
- UX: permitir cancelar con `Esc` y guardar con `Enter` en la fila de alta.
- Datos: normalizar `unidad` y `nombre` (trim) antes de guardar para evitar inconsistencias.

Notas:
- Confirmar si `condiciones` puede ser `undefined`; si no, simplificar checks.

## src/components/indicadores/IndicadorDetalle.tsx

Resumen rapido: panel lateral con detalle de indicador y lista de condiciones.

Mejoras sugeridas:
- Accesibilidad: asegurar foco inicial dentro del `SlidePanel` y `aria-labelledby` con el titulo.
- UX: manejar estado vacio si `indicador.condiciones` no tiene elementos.
- Rendimiento: memoizar `FRECUENCIAS[indicador.frecuencia]` si se recalcula frecuentemente.
- Consistencia: normalizar mayusculas en titulos y acentos ("Aceptacion" -> "Aceptacion").

Notas:
- Confirmar si el panel necesita scroll interno para listas largas.

## src/components/indicadores/IndicadorForm.tsx

Resumen rapido: formulario de alta/edicion de indicadores dentro de un panel lateral.

Mejoras sugeridas:
- Accesibilidad: asociar `label` con `htmlFor`/`id` en campos, y `aria-live` para errores.
- Validacion: validar `tiempo_correccion_valor` si se habilita, y normalizar campos con `trim`.
- UX: evitar cerrar el panel si `onSave` falla; manejar errores async en el formulario.
- Estado: usar setter funcional al actualizar `form` en callbacks para evitar stale updates.
- Datos: `identificador` se uppercase onChange y luego lowercase para validar; centralizar normalizacion.

Notas:
- Confirmar si `tiempo_correccion_unidad` debe ser enum/Select en lugar de string libre.

## src/components/indicadores/index.ts

Resumen rapido: archivo barrel que exporta componentes de indicadores.

Mejoras sugeridas:
- Consistencia: mantener orden alfabetico en exports o agrupar por flujo (form, detalle, editor).
- Lint: aplicar reglas de orden si se usa `eslint-plugin-import` para evitar ciclos.

Notas:
- Sin cambios funcionales; solo organizacion.

## src/components/layout/AppHeader.tsx

Resumen rapido: header minimal con boton para abrir menu en mobile.

Mejoras sugeridas:
- Accesibilidad: agregar `type="button"` y `aria-expanded` si controla un menu.
- UX: mostrar titulo o breadcrumbs para contexto de la seccion actual.
- Responsivo: asegurar que el header no colapse con contenido extra futuro.

Notas:
- Verificar si el menu tiene foco/keyboard support en el layout.

## src/components/layout/AppShell.tsx

Resumen rapido: layout principal con sidebar, header y overlay para menu mobile.

Mejoras sugeridas:
- Accesibilidad: agregar `aria-hidden` al overlay y `aria-expanded`/`aria-controls` en el boton del menu.
- UX: cerrar menu con `Esc` y bloquear scroll del body cuando el menu esta abierto.
- Responsivo: asegurar que el `aside` no se solape con contenido en tablets pequeñas.
- Estado: extraer hook `useMobileMenu` para evitar prop drilling si crece.

Notas:
- Confirmar que `h-screen` no cause problemas en mobile (Safari) por barras del navegador.

## src/components/layout/Sidebar.tsx

Resumen rapido: menu lateral con items de navegacion y secciones.

Mejoras sugeridas:
- Accesibilidad: marcar el item activo con `aria-current="page"` en `SidebarItem`.
- UX: extraer items a un array para reducir repeticion y facilitar reordenamiento.
- Consistencia: normalizar labels ("Operacion" -> "Operacion").

Notas:
- Confirmar si el orden del menu debe ser configurable por rol.

## src/components/layout/SidebarItem.tsx

Resumen rapido: item de navegacion con icono, label y estado activo.

Mejoras sugeridas:
- Accesibilidad: agregar `aria-current="page"` cuando `active` es true.
- UX: definir estilos focus-visible para navegacion con teclado.
- Consistencia: asegurar que `active` se derive del path actual y no de strings manuales.

Notas:
- Confirmar si se requiere soporte para `prefetch={false}` en rutas pesadas.

## src/components/layout/index.ts

Resumen rapido: archivo barrel que exporta componentes de layout.

Mejoras sugeridas:
- Consistencia: mantener orden alfabetico en exports o agrupar por uso (shell, header, sidebar).
- Lint: aplicar reglas de orden si se usa `eslint-plugin-import` para evitar ciclos.

Notas:
- Sin cambios funcionales; solo organizacion.

## src/components/shared/Badge.tsx

Resumen rapido: componente de badge con variantes de color.

Mejoras sugeridas:
- Tipado: exportar `BadgeVariant` si se usa fuera del componente.
- Consistencia: mover `variants` fuera del render para evitar recreacion por render.
- Accesibilidad: asegurar contraste suficiente en variantes claras.

Notas:
- Verificar si se requiere soporte para `title`/tooltip en badges largos.

## src/components/shared/Button.tsx

Resumen rapido: boton base con variantes y tamanos.

Mejoras sugeridas:
- Tipado: exportar `ButtonVariant` y `ButtonSize` si se usan en otros componentes.
- Accesibilidad: permitir `aria-busy` o `data-loading` para estados de carga.
- Consistencia: mover `variants`/`sizes` fuera del render para evitar recreacion.
- UX: agregar estilo `focus-visible` mas evidente en botones claros.

Notas:
- Confirmar si se necesita compatibilidad con `asChild` o `Link`.

## src/components/shared/Card.tsx

Resumen rapido: contenedor base con estilos de tarjeta.

Mejoras sugeridas:
- Consistencia: mover las clases base a una constante para evitar recreacion.
- Accesibilidad: permitir `role` opcional si se usa como region.
- UX: agregar variante sin sombra si se requiere en layouts densos.

Notas:
- Sin cambios funcionales; solo mejoras de ergonomia.

## src/components/shared/ConfirmDialog.tsx

Resumen rapido: modal de confirmacion con overlay y acciones.

Mejoras sugeridas:
- Accesibilidad: atrapar foco dentro del dialogo y restaurarlo al cerrar.
- UX: cerrar con `Esc` y click fuera si aplica; evitar doble `onClose` tras `onConfirm` si falla.
- Semantica: usar `role="dialog"` y `aria-modal="true"`.
- Estado: permitir estado de carga en el boton Confirmar.

Notas:
- Considerar reusar componente de dialog de `src/components/ui` si existe.

## src/components/shared/EmptyState.tsx

Resumen rapido: bloque simple para estados vacios con titulo y descripcion.

Mejoras sugeridas:
- Accesibilidad: permitir `role="status"` o `aria-live` si se usa tras acciones.
- UX: permitir slot para icono o accion primaria (boton).
- Consistencia: permitir variantes de alineacion o tamanos si se usa en muchas vistas.

Notas:
- Sin cambios funcionales; solo mejoras de flexibilidad.

## src/components/shared/InfoBanner.tsx

Resumen rapido: banner informativo con icono, titulo y contenido.

Mejoras sugeridas:
- Accesibilidad: agregar `role="status"` o `aria-live` si se usa para mensajes dinamicos.
- Consistencia: permitir variantes (info, warning, success) con colores definidos.
- UX: opcionalmente permitir `dismiss` si el banner es temporal.

Notas:
- Verificar contraste del texto azul en fondos claros.

## src/components/shared/InlineEdit.tsx

Resumen rapido: edicion inline con input y boton confirmar.

Mejoras sugeridas:
- Accesibilidad: agregar `aria-label` al boton de confirmar y manejar `Escape` para cancelar.
- UX: permitir cancelar al perder foco o revertir sin guardar con un boton secundario.
- Estado: evitar recrear `tempValue` en cada render con `useEffect` si no cambio.
- Consistencia: usar `type="button"` en botones internos.

Notas:
- Confirmar si se requiere validacion async antes de guardar.

## src/components/shared/Input.tsx

Resumen rapido: input base con estilos y focus ring.

Mejoras sugeridas:
- Accesibilidad: agregar estilos `focus-visible` y `aria-invalid` en validaciones.
- Consistencia: mover clases base a una constante para evitar recreacion.
- UX: permitir `type="search"`/`number` con estilos adecuados (remover spinners si aplica).

Notas:
- Confirmar si se requiere soporte para `inputMode` en numeric.

## src/components/shared/PageHeader.tsx

Resumen rapido: encabezado de pagina con titulo, subtitulo y acciones.

Mejoras sugeridas:
- Accesibilidad: asegurar que `h1` sea unico por pagina o permitir `as` configurable.
- Responsivo: alinear acciones debajo del titulo en mobile (`flex-col sm:flex-row`).
- Consistencia: permitir `subtitle` como ReactNode si se necesita contenido rico.

Notas:
- Verificar si se necesita espaciado vertical uniforme entre header y contenido.

## src/components/shared/Select.tsx

Resumen rapido: select base con estilos y focus ring.

Mejoras sugeridas:
- Accesibilidad: agregar estilos `focus-visible` y soporte para `aria-invalid`.
- Consistencia: mover clases base a una constante para evitar recreacion.
- UX: permitir un icono de desplegable personalizado si se requiere.

Notas:
- Confirmar si se necesita soporte para `multiple` con estilos distintos.

## src/components/shared/SlidePanel.tsx

Resumen rapido: panel lateral deslizante con overlay y header.

Mejoras sugeridas:
- Accesibilidad: agregar `role="dialog"`, `aria-modal="true"` y manejo de foco.
- UX: cerrar con `Esc` y bloquear scroll del body cuando esta abierto.
- Rendimiento: evitar render del panel cuando `isOpen` es false (opcional, para no capturar foco).
- Consistencia: permitir `position` (left/right) si se requiere en futuras vistas.

Notas:
- Confirmar si el overlay debe cerrar al click o si hay casos donde no.

## src/components/shared/TagMultiSelect.tsx

Resumen rapido: selector multiple de tags con reglas de exclusividad.

Mejoras sugeridas:
- Rendimiento: evitar `options.find` dentro de `map` en cada render; precomputar mapas.
- Accesibilidad: agregar `aria-pressed` y `aria-disabled` en botones.
- UX: indicar por que una opcion esta deshabilitada (tooltip/ayuda).
- Estado: preferir `Set` para operaciones de inclusion/exclusion si la lista crece.

Notas:
- Confirmar si la regla `unico` vs `bifurcado` debe ser configurable por backend.

## src/components/shared/Textarea.tsx

Resumen rapido: textarea base con estilos y focus ring.

Mejoras sugeridas:
- Accesibilidad: agregar estilos `focus-visible` y soporte para `aria-invalid`.
- Consistencia: mover clases base a una constante para evitar recreacion.
- UX: permitir `rows` por defecto y resize controlado (`resize-y`).

Notas:
- Confirmar si se requiere contador de caracteres en algunos formularios.

## src/components/ui/alert-dialog.tsx

Resumen rapido: wrapper de AlertDialog de Base UI con estilos y slots.

Mejoras sugeridas:
- Consistencia: normalizar uso de comillas (" vs ') y formato para mantener estilo del repo.
- Accesibilidad: asegurar `AlertDialogOverlay` tenga `aria-hidden` si el lib no lo agrega.
- UX: exponer prop `size` en `AlertDialog` root para no pasarla solo por `Content`.
- Rendimiento: mover `cn(...)` base a constantes si se reutiliza en varias variantes.

Notas:
- Confirmar si `Button` de `@/components/ui/button` maneja `type="button"` por defecto.

## src/components/ui/button.tsx

Resumen rapido: wrapper de Button de Base UI con variantes via `cva`.

Mejoras sugeridas:
- Consistencia: normalizar uso de comillas (" vs ') y formateo del archivo.
- Accesibilidad: considerar `aria-busy`/`data-loading` para estados asincronos.
- UX: agregar variante `icon` dedicada o aclarar uso de tamaños `icon-*`.
- Tipado: exportar tipos de `variant` y `size` con `VariantProps` si se usan fuera.

Notas:
- Confirmar si `ButtonPrimitive` requiere `type="button"` por defecto en forms.

## src/components/ui/dialog.tsx

Resumen rapido: wrapper de Dialog de Base UI con overlay, content y slots.

Mejoras sugeridas:
- Consistencia: normalizar comillas y formateo (archivo mezcla estilos).
- Accesibilidad: confirmar que `DialogOverlay` maneja `aria-hidden` y que el foco inicial se define.
- UX: exponer prop `size` o `maxWidth` para reutilizacion en distintas pantallas.
- Limpieza: el `XIcon` esta renderizado sin props; agregar clases/tamano y `aria-hidden`.

Notas:
- Verificar si `DialogClose` con `Button` necesita `type="button"`.

## src/components/ui/label.tsx

Resumen rapido: wrapper de `label` con estilos y soporte de estados.

Mejoras sugeridas:
- Consistencia: normalizar comillas y formateo para alinear con el resto del repo.
- Accesibilidad: asegurar uso con `htmlFor` en consumers para asociar input.
- UX: permitir variante `muted` o `required` para formularios extensos.

Notas:
- Confirmar si se requiere `Label` como `React.forwardRef` para casos avanzados.

## src/components/ui/progress.tsx

Resumen rapido: wrapper de Progress de Base UI con track, indicador y labels.

Mejoras sugeridas:
- Consistencia: normalizar comillas y formateo del archivo.
- Accesibilidad: asegurar `ProgressLabel` y `ProgressValue` esten conectados via `aria-labelledby` si aplica.
- UX: permitir `size` o `variant` para alturas distintas.
- Tipado: exponer un prop `value` en `Progress` como number obligatorio para evitar estados inconsistentes.

Notas:
- Confirmar si `children` en `Progress` es necesario o si conviene controlar el layout internamente.

## src/components/ui/separator.tsx

Resumen rapido: wrapper de Separator de Base UI con orientacion configurable.

Mejoras sugeridas:
- Consistencia: normalizar comillas y formateo del archivo.
- Accesibilidad: asegurar `role="separator"` se pasa correctamente segun Base UI.
- UX: permitir prop `decorative` para separar visualmente sin impacto semantico.

Notas:
- Verificar si se necesita grosor configurable para uso en secciones grandes.

## src/components/ui/sheet.tsx

Resumen rapido: wrapper de Sheet (Dialog) con sides y overlay.

Mejoras sugeridas:
- Consistencia: normalizar comillas y formateo del archivo.
- Accesibilidad: agregar `aria-hidden`/foco inicial si Base UI no lo gestiona.
- UX: permitir `size` configurable para `side` right/left (no solo 3/4).
- Limpieza: `XIcon` sin props; agregar clases/tamano y `aria-hidden`.

Notas:
- Verificar si `SheetClose` con `Button` necesita `type="button"`.

## src/components/ui/skeleton.tsx

Resumen rapido: componente de skeleton con animacion de pulso.

Mejoras sugeridas:
- Consistencia: normalizar comillas y formateo del archivo.
- Accesibilidad: agregar `aria-hidden` o `role="status"` segun uso.
- UX: permitir variante de tamanos o borde redondeado configurable.

Notas:
- Confirmar si el color de `bg-muted` es adecuado en dark/light.

## src/components/ui/table.tsx

Resumen rapido: wrapper de tabla con slots y estilos base.

Mejoras sugeridas:
- Consistencia: normalizar comillas y formateo del archivo.
- Accesibilidad: permitir `role="table"`/`aria-label` via props en `Table`.
- UX: permitir variante compacta para tablas densas.
- Rendimiento: evaluar si `TableRow` debe omitir hover cuando no es clickable.

Notas:
- Confirmar si se necesita soporte para tablas con sticky header nativo.

## src/components/ui/tooltip.tsx

Resumen rapido: wrapper de tooltip con provider, trigger y content estilizado.

Mejoras sugeridas:
- Consistencia: normalizar comillas y formateo del archivo.
- Accesibilidad: permitir `aria-label`/`aria-describedby` para tooltips sin texto visible.
- UX: exponer `delay` en `Tooltip` o permitir override por instancia.
- Rendimiento: permitir `Portal` opcional si hay muchos tooltips en listas grandes.

Notas:
- Confirmar si `TooltipPrimitive.Arrow` necesita `aria-hidden`.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { CreateMedicionDTO, RegistrosBasePayload } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('mediciones')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateMedicionDTO & { registros_base?: RegistrosBasePayload };
    const hasBase = !!(body.registros_base && Array.isArray(body.registros_base.data) && body.registros_base.data.length);
    // Inserta la medición (sin registros_base)
    const { data: created, error: errCreate } = await supabaseAdmin
      .from('mediciones')
      .insert([{
        proyecto_id: body.proyecto_id,
        unidad_funcional_id: body.unidad_funcional_id,
        ruta_id: body.ruta_id,
        carriles_seleccionados: body.carriles_seleccionados,
        indicador_id: body.indicador_id,
        fecha: body.fecha,
        datos: body.datos,
        tiene_datos_base: hasBase,
      }])
      .select()
      .single();

    if (errCreate) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errCreate.message } }, { status: 500 });

    // Si hay registros base, insertarlos en una sola fila
    if (hasBase && created?.id && body.registros_base) {
      const { headers = [], data = [] } = body.registros_base;
      const { error: errBulk } = await supabaseAdmin
        .from('mediciones_registros_base')
        .insert([{
          medicion_id: created.id,
          headers,
          data,
        }]);
      if (errBulk) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errBulk.message } }, { status: 500 });
      }
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

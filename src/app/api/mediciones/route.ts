import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { CreateMedicionDTO } from '@/types';

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
    const body = (await req.json()) as CreateMedicionDTO & { registros_base?: any[] };
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
        tiene_datos_base: !!(body.registros_base && body.registros_base.length),
      }])
      .select()
      .single();

    if (errCreate) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errCreate.message } }, { status: 500 });

    // Si hay registros base, insertarlos en bulk
    if (body.registros_base && body.registros_base.length && created?.id) {
      const rows = body.registros_base.map(r => ({
        medicion_id: created.id,
        from_m: r.from_m,
        to_m: r.to_m,
        iri_izq: r.iri_izq,
        iri_der: r.iri_der,
      }));
      const { error: errBulk } = await supabaseAdmin
        .from('mediciones_registros_base')
        .insert(rows);
      if (errBulk) {
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errBulk.message } }, { status: 500 });
      }
    }

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

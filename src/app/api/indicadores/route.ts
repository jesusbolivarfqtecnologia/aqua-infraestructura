import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { FRECUENCIAS } from '@/types';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('indicadores')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';
    const identificador = typeof body?.identificador === 'string' ? body.identificador.trim().toUpperCase() : '';
    const frecuencia = typeof body?.frecuencia === 'string' ? body.frecuencia : '';
    const unidad_medida = typeof body?.unidad_medida === 'string' ? body.unidad_medida.trim() : '';
    const condiciones = Array.isArray(body?.condiciones) ? body.condiciones : [];

    if (!nombre || !identificador || !frecuencia || !unidad_medida) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Nombre, identificador, frecuencia y unidad son obligatorios' } }, { status: 400 });
    }
    if (!FRECUENCIAS[frecuencia as keyof typeof FRECUENCIAS]) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Frecuencia invalida' } }, { status: 400 });
    }
    if (condiciones.length === 0) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Agregue al menos una condicion' } }, { status: 400 });
    }

    const payload = {
      nombre,
      identificador,
      concepto_medicion: typeof body?.concepto_medicion === 'string' ? body.concepto_medicion : '',
      normatividad: typeof body?.normatividad === 'string' ? body.normatividad : '',
      metodo_medida: typeof body?.metodo_medida === 'string' ? body.metodo_medida : '',
      frecuencia,
      frecuencia_dias: FRECUENCIAS[frecuencia as keyof typeof FRECUENCIAS].dias,
      unidad_medida,
      tiempo_correccion_valor: body?.tiempo_correccion_valor ?? null,
      tiempo_correccion_unidad: body?.tiempo_correccion_unidad || 'N/A',
      condiciones,
    };

    const { data, error } = await supabaseAdmin
      .from('indicadores')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ error: { code: 'DUPLICATE_KEY', message: 'Identificador ya existe' } }, { status: 400 });
      }
      return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

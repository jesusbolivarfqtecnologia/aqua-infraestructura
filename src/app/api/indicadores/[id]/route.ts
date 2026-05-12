import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { FRECUENCIAS } from '@/types';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('indicadores')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return NextResponse.json({ error: { code: 'NOT_FOUND', message: error.message } }, { status: 404 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updates: Record<string, any> = {};

    if (typeof body?.nombre === 'string' && body.nombre.trim()) updates.nombre = body.nombre.trim();
    if (typeof body?.identificador === 'string' && body.identificador.trim()) updates.identificador = body.identificador.trim().toUpperCase();
    if (typeof body?.concepto_medicion === 'string') updates.concepto_medicion = body.concepto_medicion;
    if (typeof body?.normatividad === 'string') updates.normatividad = body.normatividad;
    if (typeof body?.metodo_medida === 'string') updates.metodo_medida = body.metodo_medida;
    if (typeof body?.unidad_medida === 'string') updates.unidad_medida = body.unidad_medida.trim();

    if (typeof body?.frecuencia === 'string') {
      if (!FRECUENCIAS[body.frecuencia as keyof typeof FRECUENCIAS]) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Frecuencia invalida' } }, { status: 400 });
      }
      updates.frecuencia = body.frecuencia;
      updates.frecuencia_dias = FRECUENCIAS[body.frecuencia as keyof typeof FRECUENCIAS].dias;
    }

    if (Array.isArray(body?.condiciones)) {
      if (body.condiciones.length === 0) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Agregue al menos una condicion' } }, { status: 400 });
      }
      updates.condiciones = body.condiciones;
    }

    if (body?.tiempo_correccion_valor !== undefined) updates.tiempo_correccion_valor = body.tiempo_correccion_valor;
    if (typeof body?.tiempo_correccion_unidad === 'string') updates.tiempo_correccion_unidad = body.tiempo_correccion_unidad;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'No hay campos para actualizar' } }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('indicadores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ error: { code: 'DUPLICATE_KEY', message: 'Identificador ya existe' } }, { status: 400 });
      }
      return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: mediciones, error: errMed } = await supabaseAdmin
      .from('mediciones')
      .select('id')
      .eq('indicador_id', id)
      .limit(1);
    if (errMed) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errMed.message } }, { status: 500 });
    if (mediciones && mediciones.length > 0) {
      return NextResponse.json({ error: { code: 'HAS_DEPENDENTS', message: 'El indicador tiene mediciones asociadas' } }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('indicadores').delete().eq('id', id);
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

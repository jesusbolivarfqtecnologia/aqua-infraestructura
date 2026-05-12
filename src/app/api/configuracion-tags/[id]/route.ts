import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const VALID_TIPOS = new Set(['bifurcado', 'unico']);

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('configuracion_tags')
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
    const updates: Record<string, string> = {};

    if (typeof body?.tag === 'string' && body.tag.trim()) {
      updates.tag = body.tag.trim().toUpperCase();
    }
    if (typeof body?.descripcion === 'string' && body.descripcion.trim()) {
      updates.descripcion = body.descripcion.trim();
    }
    if (typeof body?.tipo === 'string' && body.tipo) {
      if (!VALID_TIPOS.has(body.tipo)) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Tipo invalido' } }, { status: 400 });
      }
      updates.tipo = body.tipo;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'No hay campos para actualizar' } }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('configuracion_tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ error: { code: 'DUPLICATE_KEY', message: 'El tag ya existe' } }, { status: 400 });
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
    const { data: tagRow, error: errTag } = await supabaseAdmin
      .from('configuracion_tags')
      .select('tag')
      .eq('id', id)
      .single();
    if (errTag) return NextResponse.json({ error: { code: 'NOT_FOUND', message: errTag.message } }, { status: 404 });

    const { data: rutas, error: errRutas } = await supabaseAdmin
      .from('rutas')
      .select('id')
      .contains('carriles_tags', [tagRow.tag])
      .limit(1);
    if (errRutas) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errRutas.message } }, { status: 500 });
    if (rutas && rutas.length > 0) {
      return NextResponse.json({ error: { code: 'HAS_DEPENDENTS', message: 'El tag esta en uso en rutas' } }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('configuracion_tags').delete().eq('id', id);
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('rutas')
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

    if (typeof body?.nombre === 'string' && body.nombre.trim()) {
      updates.nombre = body.nombre.trim();
    }
    if (Array.isArray(body?.carriles_tags)) {
      updates.carriles_tags = body.carriles_tags;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'No hay campos para actualizar' } }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('rutas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
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
      .eq('ruta_id', id)
      .limit(1);
    if (errMed) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errMed.message } }, { status: 500 });
    if (mediciones && mediciones.length > 0) {
      return NextResponse.json({ error: { code: 'HAS_DEPENDENTS', message: 'La ruta tiene mediciones asociadas' } }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('rutas').delete().eq('id', id);
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

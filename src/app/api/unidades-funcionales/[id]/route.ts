import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('unidades_funcionales')
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
    const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';
    if (!nombre) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Nombre es obligatorio' } }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('unidades_funcionales')
      .update({ nombre })
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
    const { data: rutas, error: errRutas } = await supabaseAdmin
      .from('rutas')
      .select('id')
      .eq('unidad_funcional_id', id)
      .limit(1);
    if (errRutas) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errRutas.message } }, { status: 500 });
    if (rutas && rutas.length > 0) {
      return NextResponse.json({ error: { code: 'HAS_DEPENDENTS', message: 'La UF tiene rutas asociadas' } }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('unidades_funcionales').delete().eq('id', id);
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

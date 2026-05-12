import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('proyectos')
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
    if (!body?.nombre || typeof body.nombre !== 'string' || !body.nombre.trim()) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Nombre es obligatorio' } }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('proyectos')
      .update({ nombre: body.nombre.trim() })
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
    // Chequear dependientes: unidades_funcionales
    const { data: ufs, error: errUfs } = await supabaseAdmin
      .from('unidades_funcionales')
      .select('id')
      .eq('proyecto_id', id)
      .limit(1);
    if (errUfs) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: errUfs.message } }, { status: 500 });
    if (ufs && ufs.length > 0) return NextResponse.json({ error: { code: 'HAS_DEPENDENTS', message: 'El proyecto tiene unidades funcionales asociadas' } }, { status: 400 });

    const { error } = await supabaseAdmin.from('proyectos').delete().eq('id', id);
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('mediciones')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return NextResponse.json({ error: { code: 'NOT_FOUND', message: error.message } }, { status: 404 });

    // traer registros_base
    const { data: registros, error: err2 } = await supabaseAdmin
      .from('mediciones_registros_base')
      .select('*')
      .eq('medicion_id', id)
      .order('from_m', { ascending: true });
    if (err2) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: err2.message } }, { status: 500 });

    return NextResponse.json({ data: { medicion: data, registros_base: registros } }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // eliminar registros_base primero
    await supabaseAdmin.from('mediciones_registros_base').delete().eq('medicion_id', id);
    const { error } = await supabaseAdmin.from('mediciones').delete().eq('id', id);
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data: { id } }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

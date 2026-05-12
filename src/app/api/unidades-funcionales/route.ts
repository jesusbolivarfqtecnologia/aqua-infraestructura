import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proyectoId = searchParams.get('proyecto_id');

    let query = supabaseAdmin.from('unidades_funcionales').select('*').order('created_at', { ascending: false });
    if (proyectoId) query = query.eq('proyecto_id', proyectoId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nombre = typeof body?.nombre === 'string' ? body.nombre.trim() : '';
    const proyecto_id = typeof body?.proyecto_id === 'string' ? body.proyecto_id : '';

    if (!nombre || !proyecto_id) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Nombre y proyecto_id son obligatorios' } }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('unidades_funcionales')
      .insert([{ nombre, proyecto_id }])
      .select()
      .single();
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

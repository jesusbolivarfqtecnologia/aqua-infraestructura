import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ufId = searchParams.get('unidad_funcional_id');

    let query = supabaseAdmin.from('rutas').select('*').order('created_at', { ascending: false });
    if (ufId) query = query.eq('unidad_funcional_id', ufId);

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
    const unidad_funcional_id = typeof body?.unidad_funcional_id === 'string' ? body.unidad_funcional_id : '';
    const carriles_tags = Array.isArray(body?.carriles_tags) ? body.carriles_tags : [];

    if (!nombre || !unidad_funcional_id) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Nombre y unidad_funcional_id son obligatorios' } }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('rutas')
      .insert([{ nombre, unidad_funcional_id, carriles_tags }])
      .select()
      .single();
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

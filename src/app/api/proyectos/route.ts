import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('proyectos')
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
    const body = await req.json();
    if (!body?.nombre || typeof body.nombre !== 'string' || !body.nombre.trim()) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Nombre es obligatorio' } }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('proyectos')
      .insert([{ nombre: body.nombre.trim() }])
      .select()
      .single();
    if (error) return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

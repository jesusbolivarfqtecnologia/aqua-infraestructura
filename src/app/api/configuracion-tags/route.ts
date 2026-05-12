import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const VALID_TIPOS = new Set(['bifurcado', 'unico']);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('configuracion_tags')
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
    const tag = typeof body?.tag === 'string' ? body.tag.trim().toUpperCase() : '';
    const descripcion = typeof body?.descripcion === 'string' ? body.descripcion.trim() : '';
    const tipo = typeof body?.tipo === 'string' ? body.tipo : '';

    if (!tag || !descripcion || !VALID_TIPOS.has(tipo)) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Tag, descripcion y tipo son obligatorios' } }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('configuracion_tags')
      .insert([{ tag, descripcion, tipo }])
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        return NextResponse.json({ error: { code: 'DUPLICATE_KEY', message: 'El tag ya existe' } }, { status: 400 });
      }
      return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: e.message } }, { status: 500 });
  }
}

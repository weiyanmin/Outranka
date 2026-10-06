import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'Invalid audit ID.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('audits')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id');

  if (error) {
    console.error('Failed to delete saved audit.', error);
    return NextResponse.json({ error: 'Could not delete this audit. Please try again.' }, { status: 500 });
  }
  if (!data?.length) {
    return NextResponse.json({ error: 'Audit not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, id: data[0].id });
}

import { uploadAttachment } from '@/lib/supabase/domains/tickets/ticket_attachments'
import { getServerClient } from '@/lib/supabase/server'

export async function POST(request, { params }) {
  try {
    const { id: ticketId } = await params
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file)
      return Response.json({ error: 'No file provided' }, { status: 400 });

    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user)
      return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const attachment = await uploadAttachment(ticketId, file, user.id);

    return Response.json(attachment, { status: 201 });
  } catch (error) {
    console.error('Upload API Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
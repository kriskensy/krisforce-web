import { deleteAttachment, getAttachmentSignedUrl } from '@/lib/supabase/domains/tickets/ticket_attachments'
import { getServerClient } from '@/lib/supabase/server'

export async function GET(request, { params }) {
  try {
    const { attachmentId } = await params

    const result = await getAttachmentSignedUrl(attachmentId);

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to generate download link', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { attachmentId } = await params
    const supabase = await getServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await deleteAttachment(attachmentId, user.id);

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete attachment', message: error.message },
      { status: 500 }
    );
  }
}
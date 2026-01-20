import { getServerClient } from '../../server'

export async function uploadAttachment(ticketId, file, userId) {
  const supabase = await getServerClient();

  //check if ticket exists
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id')
    .eq('id', ticketId)
    .is('deleted_at', null)
    .single();

  if (!ticket) throw new Error('Ticket not found');

  //generate unique path
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); //remove spaces and special characters
  const filePath = `${ticketId}/${Date.now()}_${sanitizedName}`;

  //upload to storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('ticket_attachments')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (storageError) throw new Error(`Storage error: ${storageError.message}`);

  //record insert
  const { data: attachment, error: dbError } = await supabase
    .from('ticket_attachments')
    .insert({
      ticket_id: ticketId,
      filename: file.name,
      file_path: filePath,
      content_type: file.type,
      file_size: file.size,
      uploaded_by: userId
    })
    .select()
    .single();

  //rollback if DB error
  if (dbError) {
    await supabase.storage.from('ticket_attachments').remove([filePath]);
    throw new Error(`Database error: ${dbError.message}`);
  }

  return attachment;
}

//expires after 60 seconds
export async function getAttachmentSignedUrl(attachmentId, expiresIn = 60) {
  try {
    const supabase = await getServerClient();

    const { data: attachment, error: dbError } = await supabase
      .from('ticket_attachments')
      .select('file_path, filename')
      .eq('id', attachmentId)
      .single();

    if (dbError || !attachment)
      throw new Error('Attachment record not found in database');

    //generate signed url
    const { data, error: storageError } = await supabase.storage
      .from('ticket_attachments')
      .createSignedUrl(attachment.file_path, expiresIn);

    if (storageError)
      throw new Error(`Storage error: ${storageError.message}`);

    return {
      signedUrl: data.signedUrl,
      filename: attachment.filename
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

//DELETE
export async function deleteAttachment(attachmentId, userId) {
  try {
    const supabase = await getServerClient();

    //get file data and user role
    const [attachmentResult, userResult] = await Promise.all([
      supabase
        .from('ticket_attachments')
        .select('file_path, uploaded_by')
        .eq('id', attachmentId)
        .single(),
      supabase
        .from('users')
        .select('roles(code)')
        .eq('id', userId)
        .single()
    ]);

    const attachment = attachmentResult.data;
    const userRole = userResult.data?.roles?.code;

    if (attachmentResult.error || !attachment)
      throw new Error('Attachment not found');

    //verify user/admin
    const isOwner = attachment.uploaded_by === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin)
      throw new Error('Permission denied: You are not the owner or an administrator');

    //delete from DB
    const { error: dbError } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError)
      throw new Error(`Database error: ${dbError.message}`);

    //delete from storage
    const { error: storageError } = await supabase.storage
      .from('ticket_attachments')
      .remove([attachment.file_path]);

    if (storageError)
      console.error(`Failed to delete physical file: ${attachment.file_path}`, storageError);

    return { success: true, message: 'Attachment deleted successfully' };
  } catch (error) {
    console.error('Error in deleteAttachment domain function:', error);
    throw error;
  }
}
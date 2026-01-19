'use server'

import { getServerClient } from "../supabase/server"
import { revalidatePath } from "next/cache"
import { createTicket } from "@/lib/supabase/domains/tickets/tickets"
import { getTicketById } from "@/lib/supabase/domains/tickets/tickets"
import { createTicketComment } from "../supabase/domains/tickets/ticket_comments"

export async function createTicketAction(formData) {
  try {
    const file = formData.get('attachment')
    
    const ticketData = {
      subject: formData.get('subject'),
      description: formData.get('message'),
      priority_id: formData.get('priority_id'),
    }

    if (!ticketData.subject || !ticketData.description) {
      return { success: false, error: "Subject and description are required." }
    }

    //server function
    const result = await createTicket(ticketData, file)
    
    revalidatePath('/protected/my-support')
    return { success: true, id: result.id }
  } catch (error) {
    console.error("Critical Action Error:", error.message)
    return { success: false, error: error.message }
  }
}

export async function getTicketDetailsAction(ticketId) {
  try {
    if (!ticketId) return { success: false, error: "Ticket ID is required" };
    
    //server function
    const data = await getTicketById(ticketId);
    
    return { success: true, data };
  } catch (error) {
    console.error("Action Error (getTicketDetails):", error.message);
    return { success: false, error: error.message };
  }
}

export async function addTicketCommentAction(ticketId, message) {
  try {
    await createTicketComment(ticketId, { message })

    //refresh
    revalidatePath('/protected/my-support')
    
    return { success: true }
  } catch (error) {
    console.error("Add Comment Error:", error.message)
    return { success: false, error: error.message }
  }
}
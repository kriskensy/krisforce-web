'use server'

import { createTicket } from "@/lib/supabase/domains/tickets/tickets"
import { revalidatePath } from "next/cache"

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

    const result = await createTicket(ticketData, file)
    
    revalidatePath('/protected/my-support')
    return { success: true, id: result.id }
  } catch (error) {
    console.error("Critical Action Error:", error.message)
    return { success: false, error: error.message }
  }
}
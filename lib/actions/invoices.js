'use server'

import { revalidatePath } from "next/cache"
import { getInvoiceById } from "@/lib/supabase/domains/invoices/invoices"

export async function getInvoiceDetailsAction(invoiceId) {
  try {
    if (!invoiceId) return { success: false, error: "Invoice ID is required" };
    
    //server function
    const data = await getInvoiceById(invoiceId);
    
    return { success: true, data };
  } catch (error) {
    console.error("Action Error (getInvoiceDetails):", error.message);
    return { success: false, error: error.message };
  }
}

export async function markInvoiceAsPaidAction(invoiceId) {
    try {
        revalidatePath('/protected/sales/invoices')
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}
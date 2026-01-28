'use server'

import { revalidatePath } from "next/cache"
import { createInvoiceFromOrder, getInvoiceById, recordPayment } from "@/lib/supabase/domains/invoices/invoices"

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

export async function createInvoiceFromOrderAction (orderId) {
  try{
    const result = await createInvoiceFromOrder(orderId);

    if(result.success) {
      revalidatePath('/protected/sales/invoices');
      return { success: true };
    }

    if(result.invoiceAlreadyExists)
      return { success: false, code: 'ALREADY_EXISTS', invoiceNumber: result.invoiceNumber };

    return { success: false, error: "Unknown error" };

  } catch(error) {
    console.error("Action Error when creating invoice from order: ", error.message);
    return { success: false, error: error.message };
  }
}

export async function recordPaymentAction(invoiceId, amount) {
  try {
    const result = await recordPayment(invoiceId, amount);

    if (result.success) {
      revalidatePath('/protected/sales/invoices');
      return { success: true };
    }

    return { success: false, error: "Failed to record payment" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
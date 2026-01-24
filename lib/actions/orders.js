'use server'

import { revalidatePath } from "next/cache"
import { getOrderById } from "@/lib/supabase/domains/orders/orders"

export async function getOrderDetailsAction(orderId) {
  try {
    if (!orderId) return { success: false, error: "Order ID is required" };
    
    //server function
    const data = await getOrderById(orderId);
    
    return { success: true, data };
  } catch (error) {
    console.error("Action Error (getOrderDetails):", error.message);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatusAction(orderId, statusId) {
    try {
        revalidatePath('/protected/sales/orders')
        return { success: true }
    } catch (error) {
        return { success: false, error: error.message }
    }
}
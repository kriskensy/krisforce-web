import { CLIENTS_SUB_FEATURES } from "@/lib/configs/features/clients"
import { PRODUCTS_SUB_FEATURES } from "@/lib/configs/features/products"
import { SALES_SUB_FEATURES } from "@/lib/configs/features/sales"
import { TICKETS_SUB_FEATURES } from "@/lib/configs/features/tickets"
import { USERS_SUB_FEATURES } from "@/lib/configs/features/users"

//the same konfigurations like in RPC function in DB: global_search
export const GLOBAL_FEATURES_MAP = {
  clients: CLIENTS_SUB_FEATURES.clients,
  invoices: SALES_SUB_FEATURES.invoices,
  orders: SALES_SUB_FEATURES.orders,
  products: PRODUCTS_SUB_FEATURES.products,
  tickets: TICKETS_SUB_FEATURES.tickets,
  users: USERS_SUB_FEATURES.users,
}
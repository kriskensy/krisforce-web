import { getColumns as getClientsColumns } from "@/app/protected/(features)/clients/clients/columns";
import { getColumns as getClientAddressesColumns } from "@/app/protected/(features)/clients/client_addresses/columns";
import { getColumns as getClientContactsColumns } from "@/app/protected/(features)/clients/client_contacts/columns";
import { getColumns as getClientNotesColumns } from "@/app/protected/(features)/clients/client_notes/columns";
import { getColumns as getContractsColumns } from "@/app/protected/(features)/clients/contracts/columns";
import { getColumns as getAddressTypesColumns } from "@/app/protected/(features)/clients/address_types/columns";
import { getColumns as getContactTypesColumns } from "@/app/protected/(features)/clients/contact_types/columns";

import { getColumns as getProductColumns } from "@/app/protected/(features)/products/products/columns";
import { getColumns as getProductCategoriesColumns } from "@/app/protected/(features)/products/categories/columns";
import { getColumns as getPriceListsColumns } from "@/app/protected/(features)/products/price_lists/columns";
import { getColumns as getPriceListsItemsColumns } from "@/app/protected/(features)/products/price_list_items/columns";

import { getColumns as getOrdersColumns } from "@/app/protected/(features)/sales/orders/orders/columns";
import { getColumns as getOrderItemsColumns } from "@/app/protected/(features)/sales/orders/order_items/columns";
import { getColumns as getOrderWorkflowColumns } from "@/app/protected/(features)/sales/orders/order_workflow/columns";
import { getColumns as getOrderShipmentsColumns } from "@/app/protected/(features)/sales/orders/order_shipments/columns";
import { getColumns as getOrderStatusesColumns } from "@/app/protected/(features)/sales/orders/order_statuses/columns";
import { getColumns as getInvoicesColumns } from "@/app/protected/(features)/sales/invoices/invoices/columns";
import { getColumns as getInvoiceStatusesColumns } from "@/app/protected/(features)/sales/invoices/invoice_statuses/columns";
import { getColumns as getInvoiceItemsColumns } from "@/app/protected/(features)/sales/invoices/invoice_items/columns";
import { getColumns as getPaymentsColumns } from "@/app/protected/(features)/sales/payments/payments/columns";
import { getColumns as getPaymentMethodsColumns } from "@/app/protected/(features)/sales/payments/payment_methods/columns";

import { getColumns as getTicketsColumns } from "@/app/protected/(features)/tickets/tickets/columns";
import { getColumns as getTicketCommentsColumns } from "@/app/protected/(features)/tickets/ticket_comments/columns";
import { getColumns as getTicketPrioritiesColumns } from "@/app/protected/(features)/tickets/ticket_priorities/columns";
import { getColumns as getTicketStatusesColumns } from "@/app/protected/(features)/tickets/ticket_statuses/columns";

import { getColumns as getUsersColumns } from "@/app/protected/(features)/users/users/columns";
import { getColumns as getRolesColumns } from "@/app/protected/(features)/users/roles/columns";
import { getContactMessagesColumns } from "@/app/protected/(features)/contact-messages/columns";
import { getMyOrdersColumns } from "@/app/protected/(features)/my-orders/columns";
import { getMyInvoicesColumns } from "@/app/protected/(features)/my-invoices/columns";
import { getMySupportColumns } from "@/app/protected/(features)/my-support/columns";

export const GLOBAL_COLUMNS_REGISTRY = {
  //clients
  'clients': getClientsColumns,
  'client_addresses': getClientAddressesColumns,
  'client_contacts': getClientContactsColumns,
  'client_notes': getClientNotesColumns,
  'contracts': getContractsColumns,
  'address_types': getAddressTypesColumns,
  'contact_types': getContactTypesColumns,
  //products
  'products': getProductColumns,
  'product_categories': getProductCategoriesColumns,
  'price_lists': getPriceListsColumns,
  'price_lists_items': getPriceListsItemsColumns,
  //sales
  'orders': getOrdersColumns,
  'order_items': getOrderItemsColumns,
  'order_workflow': getOrderWorkflowColumns,
  'order_shipments': getOrderShipmentsColumns,
  'order_statuses': getOrderStatusesColumns,
  'invoices': getInvoicesColumns,
  'invoice_statuses': getInvoiceStatusesColumns,
  'invoice_items': getInvoiceItemsColumns,
  'payments': getPaymentsColumns,
  'payment_methods': getPaymentMethodsColumns,
  //tickets
  'tickets': getTicketsColumns,
  'ticket_comments': getTicketCommentsColumns,
  'ticket_priorities': getTicketPrioritiesColumns,
  'ticket_statuses': getTicketStatusesColumns,
  //users
  'users': getUsersColumns,
  'roles': getRolesColumns,
  //contact messages
  'contact_messages': getContactMessagesColumns,
  //client dashboards: my-xxx
  'my-orders': getMyOrdersColumns,
  'my-invoices': getMyInvoicesColumns,
  'my-support': getMySupportColumns,
};
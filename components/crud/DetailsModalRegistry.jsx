'use client';

import TicketDetailsModal from "@/components/tickets/TicketDetailsModal";
import { OrderDetailsModal } from "../sales/OrderDetailsModal";
import { InvoiceDetailsModal } from "../sales/InvoiceDetailsModal";
import { GenericDetailsModal } from "./GenericDetailsModal";

export function DetailsModalRegistry({ 
  tableKey, 
  viewItem, 
  onClose, 
  userLevel, 
  fields, 
  title, 
  renderExtra 
}) {
  if (!viewItem) return null;

  const commonProps = {
    isOpen: !!viewItem,
    onClose: onClose,
  };

  switch (tableKey) {
    case 'tickets':
      return (
        <TicketDetailsModal 
          {...commonProps} 
          ticketId={viewItem.id} 
          userLevel={userLevel} 
        />
      );

    case 'orders':
      return (
        <OrderDetailsModal 
          {...commonProps} 
          orderId={viewItem.id} 
        />
      );

    case 'invoices':
      return (
        <InvoiceDetailsModal 
          {...commonProps} 
          invoiceId={viewItem.id} 
        />
      );

    default:
      return (
        <GenericDetailsModal
          {...commonProps}
          item={viewItem}
          fields={fields}
          title={title}
        >
          {renderExtra && renderExtra(viewItem)}
        </GenericDetailsModal>
      );
  }
}
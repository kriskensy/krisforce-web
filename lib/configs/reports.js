
export const REPORT_CONFIGS = {
  client_summary: {
    title: 'Client Performance Summary',
    viewName: 'report_client_summary',
    columns: [
      { id: 'client_name', label: 'Client Name', default: true },
      { id: 'nip', label: 'Tax ID (NIP)', default: true },
      { id: 'total_orders', label: 'Orders Count', default: true },
      { id: 'total_invoice', label: 'Total Invoiced', default: true, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'total_paid_to', label: 'Total Paid', default: true, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'current_debt', label: 'Outstanding Balance', default: true, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'joined_date', label: 'Customer Since', default: false, format: (v) => new Date(v).toLocaleDateString() },
      { id: 'total_tickets', label: 'Total Tickets', default: false },
    ],
  },

  contracts: {
    title: 'Client Contracts Overview',
    viewName: 'report_contracts',
    columns: [
      { id: 'contract_number', label: 'Contract No.', default: true },
      { id: 'start_date', label: 'Start Date', default: true },
      { id: 'end_date', label: 'End Date', default: true },
      { id: 'contract_value', label: 'Value', default: true, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'status', label: 'Status', default: true },
    ],
  },

  invoices: {
    title: 'Invoices & Billing Report',
    viewName: 'report_invoices',
    columns: [
      { id: 'invoice_number', label: 'Invoice No.', default: true },
      { id: 'invoice_date', label: 'Issue Date', default: true },
      { id: 'due_date', label: 'Due Date', default: true },
      { id: 'total_amount', label: 'Total Amount', default: true, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'paid_amount', label: 'Paid Amount', default: false, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'amount_to_pay', label: 'Remaining', default: true, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'status_name', label: 'Status', default: true },
    ],
  },

  orders: {
    title: 'Sales Orders Report',
    viewName: 'report_orders',
    columns: [
      { id: 'order_number', label: 'Order No.', default: true },
      { id: 'order_date', label: 'Order Date', default: true },
      { id: 'total_amount', label: 'Total Value', default: true, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'status_name', label: 'Current Status', default: true },
      { id: 'items_count', label: 'Products Count', default: false },
    ],
  },

  payments: {
    title: 'Payment History Record',
    viewName: 'report_payments',
    columns: [
      { id: 'payment_date', label: 'Date', default: true },
      { id: 'payment_amount', label: 'Amount', default: true, format: (v) => `${Number(v).toLocaleString()} €` },
      { id: 'related_invoice', label: 'Invoice Ref.', default: true },
      { id: 'payment_method', label: 'Method', default: true },
    ],
  },

  tickets: {
    title: 'Support Tickets Report',
    viewName: 'report_tickets',
    columns: [
      { id: 'subject', label: 'Subject', default: true },
      { id: 'status_name', label: 'Status', default: true },
      { id: 'priority_name', label: 'Priority', default: true },
      { id: 'created_at', label: 'Created At', default: true, format: (v) => new Date(v).toLocaleDateString() },
      { id: 'comments_count', label: 'Comments', default: false },
    ],
  },
};
import { ShoppingCart, Package, Truck, FileText, DollarSign, CreditCard, Workflow, ListChecks } from "lucide-react";

//single record deatils modal
export const SALES_SUB_FEATURES = {
  'invoices': {
    title: 'Invoices',
    description: 'Manage customer invoices and billing',
    icon: FileText,
    minLevel: 2, // manager+
    tableKey: 'invoices',
    apiEndpoint: '/api/invoices',
    fields: [
      { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients' 
      },
      { 
        name: 'order_id', 
        label: 'Order', 
        type: 'select', 
        required: true, 
        source: '/api/orders' 
      },
      { 
        name: 'invoice_status_id', 
        label: 'Status', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/invoice_statuses' 
      },
      { name: 'invoice_date', label: 'Invoice Date', type: 'date', required: true },
      { name: 'due_date', label: 'Due Date', type: 'date', required: true },
      { name: 'total_amount', label: 'Total Amount', type: 'number', required: true },
      { name: 'paid_amount', label: 'Paid Amount', type: 'number', required: false },
      { name: 'created_at', label: 'Created', type: 'date', required: false },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false },
    ]
  },
  'invoice_items': {
    title: 'Invoice Items',
    description: 'Manage line items on invoices',
    icon: Package,
    minLevel: 2, // manager+
    tableKey: 'invoice_items',
    apiEndpoint: '/api/invoices/[id]/items',
    fields: [
      { 
        name: 'invoice_id', 
        label: 'Invoice', 
        type: 'select', 
        required: true, 
        source: '/api/invoices' 
      },
      { 
        name: 'product_id', 
        label: 'Product', 
        type: 'select', 
        required: true, 
        source: '/api/products' 
      },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'unit_price', label: 'Unit Price', type: 'number', required: true },
      { name: 'total_price', label: 'Total Price', type: 'number', required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
    ]
  },
  'invoice_statuses': {
    title: 'Invoice Statuses',
    description: 'Define invoice status types',
    icon: ListChecks,
    minLevel: 2, // manager+
    tableKey: 'invoice_statuses',
    apiEndpoint: '/api/enumerations/invoice_statuses',
    fields: [
      { name: 'code', label: 'Type Code', type: 'text', required: true },
      { name: 'name', label: 'Type Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
  'orders': {
    title: 'Orders',
    description: 'Manage customer orders and sales',
    icon: ShoppingCart,
    minLevel: 1, // support+
    tableKey: 'orders',
    apiEndpoint: '/api/orders',
    fields: [
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients' 
      },
      { name: 'order_number', label: 'Order Number', type: 'text', required: true },
      { name: 'order_date', label: 'Order Date', type: 'date', required: true },
      { name: 'total_amount', label: 'Total Amount', type: 'number', required: true },
      { 
        name: 'status_id', 
        label: 'Status', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/order_statuses' 
      },
      { name: 'created_by', 
        label: 'Created by', 
        type: 'select', 
        required: false, 
        source: '/api/users' 
      },
      { name: 'created_at', label: 'Created', type: 'date', required: false }
    ]
  },
  'order_items': {
    title: 'Order Items',
    description: 'Manage products and quantities in orders',
    icon: Package,
    minLevel: 1, // support+
    tableKey: 'order_items',
    apiEndpoint: '/api/orders/[id]/items',
    fields: [
      { 
        name: 'order_id', 
        label: 'Order', 
        type: 'select', 
        required: true, 
        source: '/api/orders' 
      },
      { 
        name: 'product_id', 
        label: 'Product', 
        type: 'select', 
        required: true, 
        source: '/api/products' 
      },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'unit_price', label: 'Unit Price', type: 'number', required: true },
      { name: 'total_price', label: 'Total Price', type: 'number', required: false }
    ]
  },
  'order_workflow': {
    title: 'Order Workflow',
    description: 'Track order status changes and workflow history',
    icon: Workflow,
    minLevel: 1, // support+
    tableKey: 'order_workflow',
    apiEndpoint: '/api/orders/[id]/workflow',
    fields: [
      { 
        name: 'order_id', 
        label: 'Order', 
        type: 'select', 
        required: true, 
        source: '/api/orders' 
      },
      {
        name: 'old_status_id', 
        label: 'Old Status', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/order_statuses' 
      },
      { 
        name: 'new_status_id', 
        label: 'New Status', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/order_statuses' 
      },
      { name: 'changed_at', label: 'Changed At', type: 'date', required: true }
    ]
  },
  'order_shipments': {
    title: 'Order Shipments',
    description: 'Manage order shipments and delivery tracking',
    icon: Truck,
    minLevel: 1, // support+
    tableKey: 'order_shipments',
    apiEndpoint: '/api/orders/[id]/shipments',
    fields: [
      { 
        name: 'order_id', 
        label: 'Order', 
        type: 'select', 
        required: true, 
        source: '/api/orders' 
      },
      { name: 'shipped_date', label: 'Shipment Date', type: 'date', required: true },
      { name: 'tracking_number', label: 'Tracking Number', type: 'text', required: false },
      { name: 'carrier', label: 'Carrier', type: 'text', required: false }
    ]
  },
  'order_statuses': {
    title: 'Order Statuses',
    description: 'Define order status types and workflows',
    icon: ListChecks,
    minLevel: 2, // manager+
    tableKey: 'order_statuses',
    apiEndpoint: '/api/enumerations/order_statuses',
    fields: [
      { name: 'code', label: 'Type Code', type: 'text', required: true },
      { name: 'name', label: 'Type Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
  'payments': {
    title: 'Payments',
    description: 'Manage customer payments and transactions',
    icon: DollarSign,
    minLevel: 2, // manager+
    tableKey: 'payments',
    apiEndpoint: '/api/invoices/[id]/payments',
    fields: [
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients' 
      },
      { 
        name: 'invoice_id', 
        label: 'Invoice', 
        type: 'select', 
        required: true, 
        source: '/api/invoices' 
      },
      { 
        name: 'method_id', 
        label: 'Payment Method', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/payment_methods' 
      },
      { name: 'payment_date', label: 'Payment Date', type: 'date', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false }
    ]
  },
  'payment_methods': {
    title: 'Payment Methods',
    description: 'Define available payment methods',
    icon: CreditCard,
    minLevel: 2, // manager+
    tableKey: 'payment_methods',
    apiEndpoint: '/api/enumerations/payment_methods',
    fields: [
      { name: 'code', label: 'Category Code', type: 'text', required: true },
      { name: 'name', label: 'Category Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  }
};

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
    hideAddButton: true,
    fields: [
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients' 
      },
      { 
        name: 'order_id', 
        label: 'Order number', 
        type: 'select', 
        required: true, 
        source: '/api/orders',
        relationName: 'orders',
        displayKey: 'order_number'
      },
      { 
        name: 'invoice_status_id', 
        label: 'Status', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/invoice_statuses',
        relationName: 'invoice_statuses',
        displayKey: 'name'
      },
      { name: 'invoice_date', label: 'Invoice Date', type: 'date', required: true },
      { name: 'due_date', label: 'Due Date', type: 'date', required: true },
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
    hideAddButton: true,
    fields: [
      { 
        name: 'invoice_id', 
        label: 'Invoice', 
        type: 'select', 
        required: true, 
        source: '/api/invoices',
        relationName: 'invoices',
        displayKey: 'invoice_number'
      },
      { 
        name: 'product_id', 
        label: 'Product', 
        type: 'select', 
        required: true, 
        source: '/api/products',
        relationName: 'products',
        displayKey: 'name'
      },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'unit_price', label: 'Unit Price', type: 'number', isCurrency: true, required: true },
      { name: 'description', label: 'Description', type: 'text', required: true },
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
        source: '/api/clients',
        relationName: 'clients',
        displayKey: 'name'
      },
      { name: 'order_number', label: 'Order Number', type: 'text', required: true },
      {
        name: 'status_id',
        label: 'Order Status',
        type: 'select',
        required: true,
        source: '/api/enumerations/order_statuses',
        relationName: 'order_statuses',
        displayKey: 'name'
      },
      { name: 'order_date', label: 'Order Date', type: 'date', required: true },
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
        source: '/api/orders',
        relationName: 'orders',
        displayKey: 'order_number'
      },
      { 
        name: 'product_id', 
        label: 'Product', 
        type: 'select', 
        required: true, 
        source: '/api/products' 
      },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { 
        name: 'unit_price', 
        label: 'Unit Price (Auto)', 
        type: 'number', 
        isCurrency: true, 
        required: false, 
        readOnly: true
      },
      { 
        name: 'total_price', 
        label: 'Total Price (Auto)', 
        type: 'number', 
        isCurrency: true, 
        required: false, 
        readOnly: true
      }
    ]
  },
  'order_workflow': {
    title: 'Order Workflow',
    description: 'Track order status changes and workflow history',
    icon: Workflow,
    minLevel: 1, // support+
    tableKey: 'order_workflow',
    apiEndpoint: '/api/orders/[id]/workflow',
    hideAddButton: true,
    fields: [
      { 
        name: 'order_id', 
        label: 'Order', 
        type: 'select', 
        required: true, 
        source: '/api/orders',
        relationName: 'orders',
        displayKey: 'order_number'
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
        source: '/api/orders',
        relationName: 'orders',
        displayKey: 'order_number'
      },
      { name: 'shipped_date', label: 'Shipment Date', type: 'date', required: true },
      { name: 'tracking_number', label: 'Tracking Number', type: 'text', required: false },
      { name: 'carrier', label: 'Carrier', type: 'text', required: false }
    ]
  },
  'payments': {
    title: 'Payments',
    description: 'Manage customer payments and transactions',
    icon: DollarSign,
    minLevel: 2, // manager+
    tableKey: 'payments',
    apiEndpoint: '/api/invoices/[id]/payments',
    hideAddButton: true,
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
        source: '/api/invoices',
        relationName: 'invoices',
        displayKey: 'invoice_number' 
      },
      { 
        name: 'method_id', 
        label: 'Payment Method', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/payment_methods',
        relationName: 'payment_methods',
        displayKey: 'name' 
      },
      { name: 'payment_date', label: 'Payment Date', type: 'date', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false }
    ]
  },
  'invoice_statuses': {
    title: 'Invoice Statuses',
    description: 'Define invoice status types',
    icon: ListChecks,
    minLevel: 3, //admin
    tableKey: 'invoice_statuses',
    apiEndpoint: '/api/enumerations/invoice_statuses',
    fields: [
      { name: 'code', label: 'Type Code', type: 'text', required: true },
      { name: 'name', label: 'Type Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
  'order_statuses': {
    title: 'Order Statuses',
    description: 'Define order status types and workflows',
    icon: ListChecks,
    minLevel: 3, //admin
    tableKey: 'order_statuses',
    apiEndpoint: '/api/enumerations/order_statuses',
    fields: [
      { name: 'code', label: 'Type Code', type: 'text', required: true },
      { name: 'name', label: 'Type Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
  'payment_methods': {
    title: 'Payment Methods',
    description: 'Define available payment methods',
    icon: CreditCard,
    minLevel: 3, //admin
    tableKey: 'payment_methods',
    apiEndpoint: '/api/enumerations/payment_methods',
    fields: [
      { name: 'code', label: 'Category Code', type: 'text', required: true },
      { name: 'name', label: 'Category Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
};

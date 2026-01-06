import { Package, Tags, ListTree } from "lucide-react";

export const PRODUCTS_SUB_FEATURES = {
  'list': {
    title: 'Products List',
    description: 'Manage your product and service database',
    icon: Package,
    minLevel: 1, //support+
    tableKey: 'products',
    apiEndpoint: '/api/products',
    fields: [
      { name: 'code', label: 'Product Code', type: 'text', required: true },
      { name: 'name', label: 'Product Name', type: 'text', required: true },
      { name: 'standard_price', label: 'Price', type: 'number', required: true },
      { 
        name: 'category_id', 
        label: 'Category', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/product_categories' 
      }
    ]
  },
  'categories': {
    title: 'Product Categories',
    description: 'Organize products into functional groups',
    icon: Tags,
    minLevel: 2, //manager+
    tableKey: 'product_categories',
    apiEndpoint: '/api/enumerations/product_categories',
    fields: [
      { name: 'code', label: 'Category Code', type: 'text', required: true },
      { name: 'name', label: 'Category Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
  'price_lists': {
    title: 'Price Lists',
    description: 'Define and manage customer pricing tiers',
    icon: ListTree,
    minLevel: 2,
    tableKey: 'price_lists',
    apiEndpoint: '/api/price_lists',
    fields: [
      { name: 'name', label: 'Price list name', type: 'text', required: true },
      { name: 'valid_from', label: 'Valid from', type: 'date', required: true },
      { name: 'valid_to', label: 'Valid to', type: 'date', required: true },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false  }
    ]
  },
  'price_lists_items': {
    title: 'Price Lists Items',
    description: 'Define and manage customer pricing tiers',
    icon: ListTree,
    minLevel: 2,
    tableKey: 'price_lists_items',
    apiEndpoint: '/api/price_lists/items',
    fields: [
      { 
        name: 'price_list_id', 
        label: 'Price List', 
        type: 'select', 
        required: true, 
        source: '/api/price_lists' 
      },
      { 
        name: 'product_id', 
        label: 'Product', 
        type: 'select', 
        required: true, 
        source: '/api/products' 
      },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false  }
    ]
  }
};
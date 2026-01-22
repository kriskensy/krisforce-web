import { Users, MapPin, Phone, FileText, FileStack, Handshake } from "lucide-react";

//single record deatils modal
export const CLIENTS_SUB_FEATURES = {
  'clients': {
    title: 'Clients',
    description: 'Manage your customer database',
    icon: Users,
    minLevel: 1, // support+
    tableKey: 'clients',
    apiEndpoint: '/api/clients',
    fields: [
      { name: 'name', label: 'Client Name', type: 'text', required: true },
      { name: 'nip', label: 'NIP', type: 'text', required: true },
      { name: 'created_at', label: 'Created at', type: 'date', required: true },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false  }
    ]
  },
  'client_addresses': {
    title: 'Client Addresses',
    description: 'Manage customer delivery and billing addresses',
    icon: MapPin,
    minLevel: 1, // support+
    tableKey: 'client_addresses',
    apiEndpoint: '/api/clients/[id]/addresses',
    fields: [
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients',
      },
      { 
        name: 'address_type_id', 
        label: 'Address Type', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/address_types' 
      },
      { name: 'street', label: 'Street', type: 'text', required: true },
      { name: 'zip_code', label: 'Postal Code', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false  }
    ]
  },
  'client_contacts': {
    title: 'Client Contacts',
    description: 'Manage customer contact persons and phone numbers',
    icon: Phone,
    minLevel: 1, // support+
    tableKey: 'client_contacts',
    apiEndpoint: '/api/clients/[id]/contacts',
    fields: [
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients' 
      },
      { 
        name: 'contact_type_id', 
        label: 'Contact Type', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/contact_types' 
      },
      { name: 'value', label: 'Value', type: 'text', required: true },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false  }
    ]
  },
  'client_notes': {
    title: 'Client Notes',
    description: 'Store important client information and follow-up notes',
    icon: FileText,
    minLevel: 1, // support+
    tableKey: 'client_notes',
    apiEndpoint: '/api/clients/[id]/notes',
    fields: [
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients' 
      },
      { name: 'note_text', label: 'Note Content', type: 'textarea', required: true },
      { name: 'created_at', label: 'Created', type: 'date', required: false },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false  }
    ]
  },
  'contracts': {
    title: 'Contracts',
    description: 'Manage customer contracts and agreements',
    icon: Handshake,
    minLevel: 2, // manager+
    tableKey: 'contracts',
    apiEndpoint: '/api/clients/[id]/contracts',
    fields: [
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients' 
      },
      { name: 'number', label: 'Contract Number', type: 'text', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date', required: true },
      { name: 'value', label: 'Contract Value', type: 'number',required: true },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false  }
    ]
  },
  'address_types': {
    title: 'Address Types',
    description: 'Define address categories (billing, shipping, etc.)',
    icon: FileStack,
    minLevel: 2, // manager+
    tableKey: 'address_types',
    apiEndpoint: '/api/enumerations/address_types',
    fields: [
      { name: 'code', label: 'Type Code', type: 'text', required: true },
      { name: 'name', label: 'Type Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
  'contact_types': {
    title: 'Contact Types',
    description: 'Define contact categories (owner, manager, etc.)',
    icon: FileStack,
    minLevel: 2, // manager+
    tableKey: 'contact_types',
    apiEndpoint: '/api/enumerations/contact_types',
    fields: [
      { name: 'code', label: 'Type Code', type: 'text', required: true },
      { name: 'name', label: 'Type Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  }
};

import { Ticket, MessageSquare, Paperclip, AlertCircle, ListChecks } from "lucide-react";

//TODO ticket attachments: user shuold be able to upload one to ticket
export const TICKETS_SUB_FEATURES = {
  'tickets': {
    title: 'Tickets',
    description: 'Manage customer support tickets and issues',
    icon: Ticket,
    minLevel: 1, // support+
    tableKey: 'tickets',
    apiEndpoint: '/api/tickets',
    fields: [
      { name: 'ticket_number', label: 'Ticket Number', type: 'text'},
      { 
        name: 'client_id', 
        label: 'Client', 
        type: 'select', 
        required: true, 
        source: '/api/clients' 
      },
      { name: 'subject', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { 
        name: 'status_id', 
        label: 'Status', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/ticket_statuses' 
      },
      { 
        name: 'priority_id', 
        label: 'Priority', 
        type: 'select', 
        required: true, 
        source: '/api/enumerations/ticket_priorities' 
      },
      { name: 'assigned_to', 
        label: 'Assigned To', 
        type: 'select', 
        required: false, 
        source: '/api/users' 
      },
      { name: 'created_by', 
        label: 'Created by', 
        type: 'select', 
        required: false, 
        source: '/api/users' 
      },
      { name: 'created_at', label: 'Created', type: 'date', required: false },
      { name: 'deleted_at', label: 'Deactivated?', type: 'checkbox', defaultValue: false  }
    ]
  },
  'ticket_comments': {
    title: 'Ticket Comments',
    description: 'Manage comments and communication on tickets',
    icon: MessageSquare,
    minLevel: 1, // support+
    tableKey: 'ticket_comments',
    apiEndpoint: '/api/tickets/[id]/comments',
    fields: [
      { 
        name: 'ticket_id', 
        label: 'Ticket', 
        type: 'select', 
        required: true, 
        source: '/api/tickets' 
      },
      { 
        name: 'user_id', 
        label: 'User', 
        type: 'select', 
        required: true, 
        source: '/api/users' 
      },
      { name: 'message', label: 'Comment', type: 'textarea', required: true },
      { name: 'created_at', label: 'Created', type: 'date', required: false }
    ]
  },
  'ticket_priorities': {
    title: 'Ticket Priorities',
    description: 'Define ticket priority levels',
    icon: AlertCircle,
    minLevel: 2, // manager+
    tableKey: 'ticket_priorities',
    apiEndpoint: '/api/enumerations/ticket_priorities',
    fields: [
      { name: 'code', label: 'Type Code', type: 'text', required: true },
      { name: 'name', label: 'Type Name', type: 'text', required: true },
      { name: 'level', label: 'Priority Level', type: 'number', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
  'ticket_statuses': {
    title: 'Ticket Statuses',
    description: 'Define ticket status types and workflows',
    icon: ListChecks,
    minLevel: 2, // manager+
    tableKey: 'ticket_statuses',
    apiEndpoint: '/api/enumerations/ticket_statuses',
    fields: [
      { name: 'code', label: 'Type Code', type: 'text', required: true },
      { name: 'name', label: 'Type Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  }
};

import { Users, UserCog } from "lucide-react";

//single record deatils modal
export const USERS_SUB_FEATURES = {
  'users': {
    title: 'Users',
    description: 'Manage system users and access control',
    icon: Users,
    minLevel: 3, // admin only
    tableKey: 'users',
    apiEndpoint: '/api/users',
    fields: [
      { 
        name: 'user_profiles', 
        label: 'First name', 
        type: 'text', 
        required: true, 
        source: '/api/user_profiles',
        relationName: 'user_profiles',
        displayKey: 'first_name' 
      },
      { 
        name: 'user_profiles', 
        label: 'Last name', 
        type: 'text', 
        required: true, 
        source: '/api/user_profiles',
        relationName: 'user_profiles',
        displayKey: 'last_name' 
      },
      { 
        name: 'client_id', 
        label: 'Company name', 
        type: 'select', 
        required: true,
        source: '/api/clients'
      },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { 
        name: 'role_id', 
        label: 'Role', 
        type: 'select', 
        required: true, 
        source: '/api/roles' 
      },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  },
  'user_profiles': {
    title: 'User Profiles',
    description: 'Manage user profile information and personal details',
    icon: UserCog,
    minLevel: 3, // admin only
    tableKey: 'user_profiles',
    apiEndpoint: '/api/users/[id]/profiles',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true }
    ]
  },
  'roles': {
    title: 'Roles',
    description: 'Define user roles and permission levels',
    icon: UserCog,
    minLevel: 3, // admin only
    tableKey: 'roles',
    apiEndpoint: '/api/roles',
    fields: [
      { name: 'code', label: 'Role Code', type: 'text', required: true },
      { name: 'name', label: 'Role Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true }
    ]
  }
};

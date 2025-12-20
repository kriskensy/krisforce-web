import { getServerClient, verifyAuth } from "../../server";
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { verifyAccessLevel } from "@/lib/utils/auth/verifyAccessLevel";
//TODO uncomment verifyAccess functions
//GET
export async function getClients(filters = {}) {
  try {
    const {
      search,
      limit = 10,
      offset = 0,
      orderBy = 'created_at',
      order = 'desc'
    } = filters

    // await verifyAccessLevel(1) //support+

    const supabase = await getServerClient()

    let query = supabase
      .from('clients')
      .select('id, name, nip, created_by, created_at, client_addresses (id, street, city, zip_code, address_types (code, name)), client_contacts (id, type, value), deleted_at', { count: 'exact' })
      .is('deleted_at', null) //exclude soft deleted

    //name, nip searching
    if(search) {
      query = query.or(
        `name.ilike.%${search}%,nip.ilike.%${search}%`
      )
    }

    //sort + pagination
    query = query
      .order(orderBy, { ascending: order === 'asc'})
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if(error) {
      console.warn('Supabase error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    //prepare all created_by
    const clients = data || [];

    const creatorIds = [
      ...new Set(clients.map((c) => c.created_by).filter(Boolean)),
    ];

    let profilesByUserId = {};

    if (creatorIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', creatorIds);

      if (profilesError && profilesError.code !== 'PGRST116')
        throw new Error(profilesError.message);

      (profiles || []).forEach((profile) => {
        const fullName = (profile.first_name || profile.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null;

        profilesByUserId[profile.user_id] = fullName;
      });
    }

    const extended = clients.map((client) => ({
      ...client,
      created_by_name: profilesByUserId[client.created_by] || null,
    }));

    return {
      data: extended,
      total: count || 0,
      limit,
      offset,
    };

  } catch (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
}

//GET id
export async function getClientById(id) {
  try{
    if(!id) throw new Error('Client ID is required')

    // await verifyAccessLevel(1) //support+

    const supabase = await getServerClient()

    const { data, error } = await supabase
      .from('clients')
      .select('id, name, nip, created_by, created_at, client_addresses (id, street, city, zip_code, address_types (code, name)), client_contacts (id, type, value), deleted_at')
      .eq('id', id)
      .maybeSingle()

    if(error && error.code !== 'PGRST116')
      throw new Error(error.message)

    if(!data) throw new Error('Client not found')

    //user data for created_by
    let createdByName = null;

    if (data.created_by) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('user_id', data.created_by)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116')
        throw new Error(profileError.message);

      if (profile && (profile.first_name || profile.last_name)) {
        createdByName = `${profile.first_name || ''} ${
          profile.last_name || ''
        }`.trim();
      }
    }

    return {
      ...data,
      created_by_name: createdByName,
    };

  } catch (error) {
    console.error('Error fetching client:', error)
    throw error
  }
}

//POST
export async function createClient(clientData) {
  try{
    // await verifyAccessLevel(2, 'manager');

    const { name, nip } = clientData || {};

    if (!name) throw new Error('Client name is required');
    if (!nip) throw new Error('Client nip is required');

    const supabase = await getServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user)
      throw new Error('Could not identify current user');

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116')
      throw new Error(profileError.message);

    //is NIP unique?
    if (nip) {
      const { data: existingNip, error: nipError } = await supabase
        .from('clients')
        .select('id')
        .eq('nip', nip)
        .is('deleted_at', null)
        .maybeSingle();

      if (nipError && nipError.code !== 'PGRST116')
        throw new Error(nipError.message);

      if (existingNip)
        throw new Error('Client with this NIP already exists');
    }

    const { error: insertError } = await supabase
      .from('clients')
      .insert({
        name,
        nip: nip || null,
        created_by: user.id,
        created_at: new Date().toISOString(),
        deleted_at: null,
      });

    if (insertError)
      throw new Error(`Client creation error: ${insertError.message}`);

    const { data: newClient, error: fetchError } = await supabase
      .from('clients')
      .select('id, name, nip, created_by, created_at, deleted_at')
      .eq('created_by', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116')
      throw new Error(fetchError.message);

    if(!newClient) throw new Error ('Failed to fetch created client');

    const loggedUserFullName = profile && (profile.first_name || profile.last_name) ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null;

    return {
      ...newClient,
      created_by_name: loggedUserFullName,
    };

  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

//PUT
export async function updateClient(clientId, clientData) {
  try{
    if (!clientId) throw new Error('Client ID is required');

    // await verifyAccessLevel(2);//manager+

    const { name, nip } = clientData || {};

    const supabase = await getServerClient();

    const { data: existing, error: selectError } = await supabase
      .from('clients')
      .select('id, name, nip')
      .eq('id', clientId)
      .is('deleted_at', null)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(selectError.message);

    if (!existing)
      throw new Error('Client not found');

    const updatePayload = {
      name: name !== undefined ? name : existing.name,
      nip: nip !== undefined ? nip : existing.nip,
    };

    //is nip unique?
    if (nip && nip !== existing.nip) {
      const { data: nipExists, error: nipError } = await supabase
        .from('clients')
        .select('id')
        .eq('nip', nip)
        .is('deleted_at', null)
        .neq('id', clientId)
        .maybeSingle();

      if (nipError && nipError.code !== 'PGRST116')
        throw new Error(nipError.message);

      if (nipExists)
        throw new Error('Client with this NIP already exists');
    }

    const { error: updateError } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', clientId);

    if (updateError)
      throw new Error(`Client update error: ${updateError.message}`);

    return getClientById(clientId);
  } catch (error) {
    console.error ('Error updating client:', error)
    throw error
  }
}

//DELETE - soft delete / deactivate
export async function deactivateClient(id) {
  try {
    if(!id) throw new Error('Client ID is required')

    // await verifyAccessLevel(2); //manager +

    const supabase = await getServerClient()

    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if(error) throw new Error(error.message)

    return getClientById(id)

  } catch (error) {
    console.error('Error deactivating client:', error)
    throw error
  }
}

//PATCH - reactivate
export async function reactivateClient(id) {
  try {
    if(!id) throw new Error('Client ID is required')

    // await verifyAccessLevel(2); //manager +
    
    const supabase = await getServerClient()

    const { error } = await supabase
      .from('clients')
      .update({ deleted_at: null })
      .eq('id', id)

    if(error) throw new Error(error.message)

    return getClientById(id)

  } catch (error) {
    console.error('Error reactivating client:', error.message)
    throw error
  }
}
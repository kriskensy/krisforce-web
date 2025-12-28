import { getServerClient } from '@/lib/supabase/server';
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel';

//GET
export async function getClientAddresses(clientId, filters) {
  try{
    if (!clientId) throw new Error('Client ID is required');

    await verifyAccessLevel(1);//suppor+

    const { limit = 10, offset = 0 } = filters || {};

    const supabase = await getServerClient();

    const { data, error, count } = await supabase
      .from('client_addresses')
      .select(
        'id, client_id, address_type_id, street, city, zip_code, address_types(id, code, name)',
        { count: 'exact' }
      )
      .eq('client_id', clientId)
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Database error: ${error.message}`);

    return { data: data || [], total: count || 0, limit, offset };
  } catch (error) {
    console.error('Error fetching addresses:', error)
    throw error
  }
}

//GET
export async function getClientAddressById(clientId, addressId) {
  try{
    if (!clientId || !addressId) throw new Error('Client ID and Address ID are required');

    await verifyAccessLevel(1);//support+

    const supabase = await getServerClient();

    const { data, error } = await supabase
      .from('client_addresses')
      .select('id, client_id, address_type_id, street, city, zip_code, address_types(id, code, name)')
      .eq('id', addressId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message);

    if (!data)
      throw new Error('Address not found');

    return data;
  } catch (error) {
    console.error('Error fetching client address:', error)
    throw error
  }
}

//POST
export async function createClientAddress(clientId, payload) {
  try{
    if (!clientId)  throw new Error('Client ID is required');

    await verifyAccessLevel(2);//manager+

    const { address_type_id, street, city, zip_code } = payload || {};

    if (!address_type_id || !street || !city)
      throw new Error('Address type, street, and city are required');

    const supabase = await getServerClient();

    const { data: clientExists, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .is('deleted_at', null)
      .maybeSingle();

    if (clientError && clientError.code !== 'PGRST116')
      throw new Error(clientError.message);

    if (!clientExists)
      throw new Error('Client not found');

    const { error: insertError } = await supabase
      .from('client_addresses')
      .insert({
        client_id: clientId,
        address_type_id,
        street,
        city,
        zip_code: zip_code || null,
      });

    if (insertError) {
      throw new Error(`Address creation error: ${insertError.message}`);
    }

    const { data: newAddress, error: fetchError } = await supabase
      .from('client_addresses')
      .select('id, client_id, address_type_id, street, city, zip_code, address_types(id, code, name)')
      .eq('client_id', clientId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116')
      throw new Error(fetchError.message);

    return newAddress;
  } catch (error) {
    console.error('Error creating client address:', error)
    throw error
  }
}

//PUT
export async function updateClientAddress(clientId, addressId, payload) {
  try{
    if (!clientId || !addressId)
      throw new Error('Client ID and Address ID are required');

    await verifyAccessLevel(2);//manager+

    const { address_type_id, street, city, zip_code } = payload || {};

    const supabase = await getServerClient();

    const { data: existing, error: selectError } = await supabase
      .from('client_addresses')
      .select('id, address_type_id, street, city, zip_code')
      .eq('id', addressId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(selectError.message);

    if (!existing)
      throw new Error('Address not found');

    const updatePayload = {
      address_type_id: address_type_id !== undefined ? address_type_id : existing.address_type_id,
      street: street !== undefined ? street : existing.street,
      city: city !== undefined ? city : existing.city,
      zip_code: zip_code !== undefined ? zip_code : existing.zip_code,
    };

    const { error: updateError } = await supabase
      .from('client_addresses')
      .update(updatePayload)
      .eq('id', addressId);

    if (updateError)
      throw new Error(`Address update error: ${updateError.message}`);

    return getClientAddressById(clientId, addressId);
  } catch (error) {
    console.error ('Error updating client address:', error)
    throw error
  }
}

//DELETE
export async function deleteClientAddress(clientId, addressId) {
  try{
    if (!clientId || !addressId)
      throw new Error('Client ID and Address ID are required');

    await verifyAccessLevel(2); //manager+

    const supabase = await getServerClient();

    const { data: existing, error: selectError } = await supabase
      .from('client_addresses')
      .select('id')
      .eq('id', addressId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(selectError.message);

    if (!existing)
      throw new Error('Address not found');

    const { error: deleteError } = await supabase
      .from('client_addresses')
      .delete()
      .eq('id', addressId);

    if (deleteError)
      throw new Error(`Address delete error: ${deleteError.message}`);

    return null;
  } catch (error) {
    console.error('Error deleting client adress:', error)
    throw error
  }
}
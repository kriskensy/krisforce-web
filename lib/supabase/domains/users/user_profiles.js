import { getServerClient } from '@/lib/supabase/server';
import { verifyAccessLevel } from '@/lib/utils/auth/verifyAccessLevel';

export async function getUserProfiles(filters) {
  try {
    await verifyAccessLevel(1); //support+

    const { 
      limit = 10, 
      offset = 0 
    } = filters;

    const supabase = await getServerClient();

    let query = supabase
      .from('user_profiles')
      .select('id, user_id, first_name, last_name, users(id, email, active, created_at)',
        { count: 'exact' }
      )

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('id', { ascending: false });

    if (error) throw new Error(`Database error: ${error.message}`);

    return {
      data: data || [],
      total: count || 0,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    throw error;
  }
}

export async function getUserProfileById(userId, profileId) {
  try {
    if (!userId || !profileId) throw new Error('User ID and Profile ID are required');

    await verifyAccessLevel(1); //support+

    const supabase = await getServerClient();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, user_id, first_name, last_name, phone, users(id, email, active)')
      .eq('id', profileId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116')
      throw new Error(error.message);

    if (!data)
      throw new Error('User profile not found');

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function createUserProfile(userId, payload) {
  try {
    if (!userId) throw new Error('User ID is required');

    await verifyAccessLevel(2); //manager+

    const { first_name, last_name, phone } = payload || {};

    if (!first_name || !last_name)
      throw new Error('First name and last name are required');

    const supabase = await getServerClient();

    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (userError && userError.code !== 'PGRST116')
      throw new Error(userError.message);

    if (!userExists)
      throw new Error('User not found');

    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        first_name,
        last_name,
        phone: phone || null,
      });

    if (insertError)
      throw new Error(`Profile creation error: ${insertError.message}`);

    return getUserProfileById(userId, userId);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId, profileId, payload) {
  try {
    if (!userId || !profileId)
      throw new Error('User ID and Profile ID are required');

    await verifyAccessLevel(2); //manager+

    const { first_name, last_name, phone } = payload || {};

    const supabase = await getServerClient();

    const { data: existing, error: selectError } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, phone')
      .eq('id', profileId)
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(selectError.message);

    if (!existing)
      throw new Error('User profile not found');

    const updatePayload = {
      first_name: first_name !== undefined ? first_name : existing.first_name,
      last_name: last_name !== undefined ? last_name : existing.last_name,
      phone: phone !== undefined ? phone : existing.phone,
    };

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updatePayload)
      .eq('id', profileId);

    if (updateError)
      throw new Error(`Profile update error: ${updateError.message}`);

    return getUserProfileById(userId, profileId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function deleteUserProfile(userId, profileId) {
  try {
    if (!userId || !profileId)
      throw new Error('User ID and Profile ID are required');

    await verifyAccessLevel(2); //manager+

    const supabase = await getServerClient();

    const { data: existing, error: selectError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116')
      throw new Error(selectError.message);

    if (!existing)
      throw new Error('User profile not found');

    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', profileId);

    if (deleteError)
      throw new Error(`Profile delete error: ${deleteError.message}`);

    return null;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
}
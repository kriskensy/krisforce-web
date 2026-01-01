'use server'
import { SUPPORTED_NATIVE_MODULES } from "@/node_modules/next/dist/build/webpack/plugins/middleware-plugin"
import { getServerClient } from "../supabase/server"
import { verifyAccessLevel } from "../utils/auth/verifyAccessLevel"
import { revalidatePath } from "next/cache"

export async function updateContent(id, newValue) {
  try{
    await verifyAccessLevel(3)//admin
    const supabase = await getServerClient();

    const { error } = await supabase
      .from('site_content')
      .update({ value: newValue, updated_at: new Date() })
      .eq('id', id);

    if(error) throw error;

    revalidatePath('/')
    return { success: true}

  } catch(error) {
    return { error: error.message };
  }
}

export async function uploadImage(formData) {
  try {
    await verifyAccessLevel(3) //admin
    const supabase = await getServerClient();
    const file = formData.get('file')
    const fileName = `${Date.now()}-${file.name}`;

    //storage upload
    const { data: storageData, error: storageError } = await supabase.storage
      .from('site_assets')
      .upload(fileName, file);

    if(storageError) throw storageError;

    //public url
    const { data: { publicUrl } } = supabase.storage
      .from('site_assets')
      .getPublicUrl(fileName);

    return { url: publicUrl };

  } catch(error) {
    return { error: error.message }
  }
}
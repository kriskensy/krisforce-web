import { getUserAccessLevel } from '@/lib/utils/auth/getUserAccessLevel';
import { getServerClient } from "@/lib/supabase/server";
import { REPORT_CONFIGS } from "@/lib/configs/reports";

export async function GET(request, { params }) {
  try {
    const supabase = await getServerClient();
    const { type } = await params;
    const accessInfo = await getUserAccessLevel();

    if (accessInfo.level < 2) {
      return Response.json(
        { error: 'Forbidden: Access restricted to Managers and Admins.' }, 
        { status: 403 }
      );
    }

    const config = REPORT_CONFIGS[type];
    if (!config) return Response.json({ error: 'Report not found' }, { status: 404 });

    const { data, error } = await supabase
      .from(config.viewName)
      .select('*');

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 });
  }
}
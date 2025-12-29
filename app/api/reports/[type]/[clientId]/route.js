import { verifyAccessLevel, getUserAccessLevel } from "@/lib/utils/auth/verifyAccessLevel";
import { getServerClient } from "@/lib/supabase/server";
import { REPORT_CONFIGS } from "@/lib/configs/reports";

//only manager+ or client for his own company
export async function GET(request, { params }) {
  try{
    const { type, clientId: paramClientId } = await params

    const supabase = await getServerClient()
    const accessInfo = await getUserAccessLevel();
    const config = REPORT_CONFIGS[type];

    if(!config)
      return Response.json(
        { error: 'Report type not found' },
        { status: 404 }
    )
    
    //"me" - client_id from param as "me" in url for clients
    const effectiveClientId = paramClientId === "me" ? accessInfo.clientId : paramClientId

    if(!effectiveClientId)
      return Response.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )

    //only manager+
    const restrictionTypes = [
      'report_client_summary', 
      'report_contracts',
      'report_tickets'
    ]

    if(restrictionTypes.includes(type))
      await verifyAccessLevel(2)//manager+

    if(accessInfo.level < 2 && accessInfo.clientId !== effectiveClientId){
      return Response.json(
        { error: 'Unauthorized: You can only access your own data.' }, 
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from(config.viewName)
      .select('*')
      .eq('client_id', effectiveClientId)

    if (error) {
      console.error(`Supabase error in ${type} report:`, error);
      throw new Error('Failed to fetch report data from database.');
    }

    return Response.json(data, { status: 200 });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 403 }
    )
  }
}
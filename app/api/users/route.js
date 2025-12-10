import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || 100
    const offset = searchParams.get('offset') || 0

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser()

    if(!user) {
      return NextResponse.json(
        { error: "Unauthorized "},
        { status: 401 }
      )
    }

    const  { data, error } = await supabase
      .from('users')
      .select('*, roles(name)') //TODO relacja user_profiles
      // .select('*, user_profiles(*), roles(name)')
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false })

    if(error) throw error

    return NextResponse.json({
      data,
      count: data?.length || 0,
      total: data?.length || 0
    })

  } catch (error) {
    return NextResponse.json({error: error.message}, { status: 500 })
  }
}
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || 10
    const offset = searchParams.get('offset') || 0

    const { data, error } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('id')

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
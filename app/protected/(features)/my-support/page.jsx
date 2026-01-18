import { getTickets } from "@/lib/supabase/domains/tickets/tickets"
import { getServerClient } from "@/lib/supabase/server"
import MySupportView from "./MySupportView"

export default async function MySupportPage(props) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || '';
  const statusFilter = searchParams?.status || null;

  const supabase = await getServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-8">Unauthorized.</div>

  const { data: userData } = await supabase
    .from('users')
    .select('client_id')
    .eq('id', user.id)
    .single()

  const clientId = userData?.client_id;

  const [ticketsRes, prioritiesRes, statusesRes] = await Promise.all([
    getTickets({ 
      client: clientId, 
      search: search,
      status: statusFilter,
      activeOnly: true 
    }),
    supabase.from('ticket_priorities').select('*').order('level'),
    supabase.from('ticket_statuses').select('*').order('name')
  ])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Support Tickets</h1>
      <MySupportView 
        tickets={ticketsRes?.data || []} 
        priorities={prioritiesRes?.data || []} 
        statuses={statusesRes?.data || []}
        searchParams={searchParams}
      />
    </div>
  )
}
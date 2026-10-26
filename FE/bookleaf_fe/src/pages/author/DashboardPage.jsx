import { useQuery }   from '@tanstack/react-query'
import { Link }        from 'react-router-dom'
import { useAuth }     from '../../context/AuthContext.jsx'
import bookApi         from '../../api/book.api.js'
import ticketApi       from '../../api/ticket.api.js'
import StatCard        from '../../components/ui/StatCard.jsx'
import Badge           from '../../components/ui/Badge.jsx'
import Button          from '../../components/ui/Button.jsx'
import EmptyState      from '../../components/ui/EmptyState.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { fmtRupee, fmtRelative, firstName } from '../../utils/helpers.js'
import { BookOpen, IndianRupee, TrendingUp, Ticket, PlusCircle } from 'lucide-react'

const DashboardPage = () => {
  const { user } = useAuth()

  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['my-books'],
    queryFn:  () => bookApi.getMyBooks(),
  })

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['my-tickets', { limit: 3 }],
    queryFn:  () => ticketApi.getMyTickets({ limit: 3 }),
  })

  if (booksLoading || ticketsLoading) return <PageSpinner />

  const summary  = booksData?.data?.summary  || {}
  const tickets  = ticketsData?.data         || []

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-base">
          Welcome back, {firstName(user?.name)} 👋
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Here's a summary of your publishing activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Books"
          value={summary.totalBooks ?? 0}
          sub={`${summary.publishedBooks ?? 0} published`}
          icon={BookOpen}
          accent="primary"
        />
        <StatCard
          label="Copies Sold"
          value={(summary.totalCopiesSold ?? 0).toLocaleString('en-IN')}
          icon={TrendingUp}
          accent="info"
        />
        <StatCard
          label="Total Earned"
          value={fmtRupee(summary.totalEarned ?? 0)}
          icon={IndianRupee}
          accent="success"
        />
        <StatCard
          label="Royalty Pending"
          value={fmtRupee(summary.totalPending ?? 0)}
          sub="Next payout in 45 days of quarter end"
          icon={IndianRupee}
          accent={summary.totalPending > 0 ? 'warning' : 'primary'}
        />
      </div>

      {/* Recent tickets */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-text-base flex items-center gap-2">
            <Ticket size={18} className="text-primary-500" /> Recent Tickets
          </h2>
          <Link to="/tickets">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No tickets yet"
            description="Have a question about your book or royalties? Submit a support query."
            action={
              <Link to="/tickets/new">
                <Button size="sm"><PlusCircle size={14} /> Submit Query</Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((t) => (
              <Link
                key={t.id}
                to={`/tickets/${t.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface-alt transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-base truncate">{t.subject}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t.ticketCode} · {fmtRelative(t.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Badge variant={t.priority} label={t.priority} />
                  <Badge variant={t.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick action */}
      <div className="card p-6 flex items-center justify-between bg-primary-50 border-primary-200">
        <div>
          <p className="font-semibold text-primary-800">Have a question?</p>
          <p className="text-sm text-primary-600 mt-0.5">
            Submit a support query and our team will get back to you.
          </p>
        </div>
        <Link to="/tickets/new">
          <Button>
            <PlusCircle size={16} /> Submit Query
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default DashboardPage

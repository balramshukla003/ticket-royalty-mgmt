import { useState }  from 'react'
import { useQuery }  from '@tanstack/react-query'
import { Link }      from 'react-router-dom'
import ticketApi     from '../../api/ticket.api.js'
import Badge         from '../../components/ui/Badge.jsx'
import Button        from '../../components/ui/Button.jsx'
import EmptyState    from '../../components/ui/EmptyState.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { fmtRelative } from '../../utils/helpers.js'
import { Ticket, PlusCircle, ChevronRight } from 'lucide-react'

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN',        label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED',    label: 'Resolved' },
  { value: 'CLOSED',      label: 'Closed' },
]

const MyTicketsPage = () => {
  const [status, setStatus] = useState('')
  const [page,   setPage]   = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets', { status, page }],
    queryFn:  () => ticketApi.getMyTickets({ status: status || undefined, page, limit: 10 }),
  })

  const tickets = data?.data  || []
  const meta    = data?.meta  || {}

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-base">My Tickets</h1>
          <p className="text-text-muted text-sm mt-1">Track your support queries</p>
        </div>
        <Link to="/tickets/new">
          <Button size="sm"><PlusCircle size={14} /> New Query</Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatus(opt.value); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${status === opt.value
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-surface text-text-muted border-border hover:border-primary-300'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <PageSpinner />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No tickets found"
          description={status ? 'No tickets with this status.' : 'Submit a query to get started.'}
          action={
            !status && (
              <Link to="/tickets/new">
                <Button size="sm"><PlusCircle size={14} /> Submit Query</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="card divide-y divide-border">
          {tickets.map((t) => (
            <Link
              key={t.id}
              to={`/tickets/${t.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-surface-alt transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-text-base">{t.subject}</span>
                  {t.isOverdue && (
                    <span className="badge bg-danger-light text-danger-dark border border-danger/20 text-[10px]">
                      Awaiting response
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {t.ticketCode} · {t.categoryLabel} · {fmtRelative(t.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={t.priority} label={t.priority} />
                <Badge variant={t.status} />
                <ChevronRight size={16} className="text-text-light" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>Page {meta.page} of {meta.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTicketsPage

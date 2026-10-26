import { useState }  from 'react'
import { useQuery }  from '@tanstack/react-query'
import { Link }      from 'react-router-dom'
import adminApi      from '../../api/admin.api.js'
import Badge         from '../../components/ui/Badge.jsx'
import Button        from '../../components/ui/Button.jsx'
import StatCard      from '../../components/ui/StatCard.jsx'
import EmptyState    from '../../components/ui/EmptyState.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { fmtRelative } from '../../utils/helpers.js'
import { Ticket, AlertCircle, Clock, UserCheck, Inbox, ChevronRight, Search } from 'lucide-react'

const STATUS_OPTS   = [
  { value: '',            label: 'All'         },
  { value: 'OPEN',        label: 'Open'        },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED',    label: 'Resolved'    },
  { value: 'CLOSED',      label: 'Closed'      },
]

const PRIORITY_OPTS = [
  { value: '',         label: 'All Priorities' },
  { value: 'CRITICAL', label: 'Critical'       },
  { value: 'HIGH',     label: 'High'           },
  { value: 'MEDIUM',   label: 'Medium'         },
  { value: 'LOW',      label: 'Low'            },
]

const CATEGORY_OPTS = [
  { value: '',                        label: 'All Categories'             },
  { value: 'ROYALTY_PAYMENTS',        label: 'Royalty & Payments'         },
  { value: 'ISBN_METADATA',           label: 'ISBN & Metadata'            },
  { value: 'PRINTING_QUALITY',        label: 'Printing & Quality'         },
  { value: 'DISTRIBUTION_AVAILABILITY', label: 'Distribution'            },
  { value: 'BOOK_STATUS_PRODUCTION',  label: 'Book Status'                },
  { value: 'GENERAL_INQUIRY',         label: 'General'                    },
]

const AdminTicketQueue = () => {
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '', assignedToMe: '' })
  const [page, setPage]       = useState(1)

  const setFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1) }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', { ...filters, page }],
    queryFn:  () => adminApi.getTickets({
      ...filters,
      status:   filters.status   || undefined,
      priority: filters.priority || undefined,
      category: filters.category || undefined,
      search:   filters.search   || undefined,
      assignedToMe: filters.assignedToMe || undefined,
      page,
      limit: 15,
    }),
    refetchInterval: 20000,
  })

  const tickets = data?.data || []
  const meta    = data?.meta || {}

  // Quick stats from current view
  const openCount     = tickets.filter((t) => t.status === 'OPEN').length
  const criticalCount = tickets.filter((t) => t.priority === 'CRITICAL').length
  const unassigned    = tickets.filter((t) => !t.assignedTo).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-text-base">Ticket Queue</h1>
        <p className="text-text-muted text-sm mt-1">
          {meta.total ?? tickets.length} tickets · sorted by priority then age
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"      value={meta.total ?? 0}  icon={Ticket}     accent="primary" />
        <StatCard label="Open"       value={openCount}         icon={Inbox}      accent="warning" />
        <StatCard label="Critical"   value={criticalCount}     icon={AlertCircle} accent="danger" />
        <StatCard label="Unassigned" value={unassigned}        icon={UserCheck}  accent="info"    />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input
            className="input pl-9 text-xs"
            placeholder="Search by subject or ticket code…"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        {[
          { key: 'status',   opts: STATUS_OPTS   },
          { key: 'priority', opts: PRIORITY_OPTS },
          { key: 'category', opts: CATEGORY_OPTS },
        ].map(({ key, opts }) => (
          <select
            key={key}
            className="input w-auto text-xs"
            value={filters[key]}
            onChange={(e) => setFilter(key, e.target.value)}
          >
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}

        <button
          onClick={() => setFilter('assignedToMe', filters.assignedToMe ? '' : 'true')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${filters.assignedToMe
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-surface text-text-muted border-border hover:border-primary-300'
            }`}
        >
          Assigned to me
        </button>

        <button
          onClick={() => { setFilters({ status: '', priority: '', category: '', search: '', assignedToMe: '' }); setPage(1) }}
          className="text-xs text-text-muted hover:text-danger transition-colors"
        >
          Clear filters
        </button>
      </div>

      {/* Table */}
      {isLoading ? <PageSpinner /> : tickets.length === 0 ? (
        <EmptyState icon={Inbox} title="No tickets found" description="Try changing your filters." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-alt border-b border-border">
                <tr>
                  {['Ticket', 'Author', 'Category', 'Priority', 'Status', 'Assigned', 'Age', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    className={`hover:bg-surface-alt transition-colors
                      ${t.priority === 'CRITICAL' ? 'bg-danger-light/30' : ''}
                      ${t.isOverdue ? 'bg-warning-light/20' : ''}
                    `}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-base text-xs truncate max-w-[180px]">{t.subject}</p>
                      <p className="text-[11px] text-text-muted">{t.ticketCode}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{t.author?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted">{t.categoryLabel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.priority} label={t.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {t.assignedTo?.name || <span className="text-warning">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        {fmtRelative(t.createdAt)}
                      </div>
                      {t.isOverdue && (
                        <span className="text-[10px] text-danger font-medium">No response yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/tickets/${t.id}`}>
                        <button className="btn-ghost p-1.5 rounded">
                          <ChevronRight size={15} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>Page {meta.page} of {meta.totalPages} ({meta.total} total)</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!meta.hasPrev} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTicketQueue

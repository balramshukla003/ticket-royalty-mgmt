import { useState, useEffect, useRef } from 'react'
import { useParams, Link }  from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminApi  from '../../api/admin.api.js'
import Badge     from '../../components/ui/Badge.jsx'
import Button    from '../../components/ui/Button.jsx'
import Avatar    from '../../components/ui/Avatar.jsx'
import Select    from '../../components/ui/Select.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { useSocket } from '../../context/SocketContext.jsx'
import { useToast }  from '../../context/ToastContext.jsx'
import { fmtDateTime, fmtDate, fmtRupee } from '../../utils/helpers.js'
import {
  ArrowLeft, Sparkles, RefreshCw, Send, UserCheck,
  StickyNote, MessageSquare, User, Edit2, Check, X,
} from 'lucide-react'

const CATEGORY_OPTS = [
  { value: 'ROYALTY_PAYMENTS',          label: 'Royalty & Payments'              },
  { value: 'ISBN_METADATA',             label: 'ISBN & Metadata Issues'          },
  { value: 'PRINTING_QUALITY',          label: 'Printing & Quality'              },
  { value: 'DISTRIBUTION_AVAILABILITY', label: 'Distribution & Availability'     },
  { value: 'BOOK_STATUS_PRODUCTION',    label: 'Book Status & Production'        },
  { value: 'GENERAL_INQUIRY',           label: 'General Inquiry'                 },
]

const PRIORITY_OPTS = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH',     label: 'High'     },
  { value: 'MEDIUM',   label: 'Medium'   },
  { value: 'LOW',      label: 'Low'      },
]

const STATUS_OPTS = [
  { value: 'OPEN',        label: 'Open'        },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED',    label: 'Resolved'    },
  { value: 'CLOSED',      label: 'Closed'      },
]

// ── Tab component ──────────────────────────────────────────
const TABS = ['Conversation', 'Internal Notes', 'Author Info']

const AdminTicketDetail = () => {
  const { id }         = useParams()
  const ticketId       = parseInt(id)
  const { joinTicket, leaveTicket } = useSocket()
  const queryClient    = useQueryClient()
  const toast          = useToast()
  const bottomRef      = useRef(null)

  const [activeTab,   setActiveTab]   = useState('Conversation')
  const [reply,       setReply]       = useState('')
  const [note,        setNote]        = useState('')
  const [draft,       setDraft]       = useState('')
  const [editingDraft, setEditingDraft] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ticket', ticketId],
    queryFn:  () => adminApi.getTicketById(ticketId),
    refetchInterval: 20000,
  })

  useEffect(() => { joinTicket(ticketId); return () => leaveTicket(ticketId) }, [ticketId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [data?.data?.messages?.length])
  useEffect(() => { if (data?.data?.aiDraft && !draft) setDraft(data.data.aiDraft) }, [data?.data?.aiDraft])

  // ── Mutations ──────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] })
    queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
  }

  const replyMut = useMutation({
    mutationFn: (body) => adminApi.reply(ticketId, { body, wasAiDrafted: editingDraft }),
    onSuccess: () => { setReply(''); setDraft(''); setEditingDraft(false); invalidate() },
    onError: (e) => toast({ type: 'error', title: 'Failed to send', message: e.message }),
  })

  const noteMut = useMutation({
    mutationFn: (body) => adminApi.addNote(ticketId, body),
    onSuccess: () => { setNote(''); invalidate() },
    onError: (e) => toast({ type: 'error', title: 'Failed to add note', message: e.message }),
  })

  const draftMut = useMutation({
    mutationFn: () => adminApi.generateDraft(ticketId),
    onSuccess: (res) => {
      if (res?.data?.draft) { setDraft(res.data.draft); setEditingDraft(true) }
      else toast({ type: 'warning', title: 'AI unavailable', message: 'Write your reply manually.' })
      invalidate()
    },
    onError: () => toast({ type: 'warning', title: 'AI unavailable', message: 'Write your reply manually.' }),
  })

  const statusMut    = useMutation({ mutationFn: (s) => adminApi.updateStatus(ticketId, s),    onSuccess: invalidate })
  const categoryMut  = useMutation({ mutationFn: (c) => adminApi.overrideCategory(ticketId, c), onSuccess: invalidate })
  const priorityMut  = useMutation({ mutationFn: (p) => adminApi.overridePriority(ticketId, p), onSuccess: invalidate })
  const assignMut    = useMutation({ mutationFn: () => adminApi.assignToSelf(ticketId),          onSuccess: invalidate })

  if (isLoading) return <PageSpinner />
  const ticket = data?.data
  if (!ticket) return <p className="p-6 text-text-muted">Ticket not found.</p>

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back */}
      <Link to="/admin/tickets" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-600">
        <ArrowLeft size={15} /> Back to queue
      </Link>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-text-base">{ticket.subject}</h1>
            <p className="text-xs text-text-muted mt-1">{ticket.ticketCode} · {ticket.author?.name} · {fmtDateTime(ticket.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={ticket.priority} label={ticket.priority} />
            <Badge variant={ticket.status} />
            {ticket.aiStatus === 'PENDING' && (
              <span className="badge bg-info-light text-info border border-info/20 animate-pulse">AI processing…</span>
            )}
            {ticket.aiStatus === 'FAILED' && (
              <span className="badge bg-warning-light text-warning-dark border border-warning/20">AI failed</span>
            )}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border items-center">
          <select
            className="input w-auto text-xs"
            value={ticket.status}
            onChange={(e) => statusMut.mutate(e.target.value)}
          >
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex items-center gap-1">
            <select
              className="input w-auto text-xs"
              value={ticket.category}
              onChange={(e) => categoryMut.mutate(e.target.value)}
            >
              {CATEGORY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {ticket.categoryOverridden && (
              <span className="text-[10px] text-primary-500 font-medium">overridden</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <select
              className="input w-auto text-xs"
              value={ticket.priority}
              onChange={(e) => priorityMut.mutate(e.target.value)}
            >
              {PRIORITY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {ticket.priorityOverridden && (
              <span className="text-[10px] text-primary-500 font-medium">overridden</span>
            )}
          </div>

          {!ticket.assignedTo ? (
            <Button size="sm" variant="secondary" onClick={() => assignMut.mutate()} loading={assignMut.isPending}>
              <UserCheck size={13} /> Assign to me
            </Button>
          ) : (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <UserCheck size={13} className="text-success" /> {ticket.assignedTo.name}
            </span>
          )}
        </div>

        {/* Original description */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-text-muted font-medium mb-1">Original query</p>
          <p className="text-sm text-text-base whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
        </div>
      </div>

      {/* AI Draft panel */}
      {(ticket.aiStatus === 'DONE' || draftMut.isPending || draft) && (
        <div className="card p-5 border-primary-200 bg-primary-50/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-500" />
              <span className="text-sm font-semibold text-primary-700">AI-Drafted Response</span>
              {ticket.aiReason && (
                <span className="text-xs text-text-muted">· {ticket.aiReason}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => draftMut.mutate()} loading={draftMut.isPending}>
                <RefreshCw size={12} /> Regenerate
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setReply(draft); setEditingDraft(true); setActiveTab('Conversation') }}>
                <Edit2 size={12} /> Use draft
              </Button>
            </div>
          </div>

          {draftMut.isPending ? (
            <p className="text-sm text-text-muted animate-pulse">Generating response…</p>
          ) : draft ? (
            <p className="text-sm text-text-base leading-relaxed whitespace-pre-wrap">{draft}</p>
          ) : (
            <Button size="sm" onClick={() => draftMut.mutate()} loading={draftMut.isPending}>
              <Sparkles size={13} /> Generate AI Draft
            </Button>
          )}
        </div>
      )}

      {/* No draft yet */}
      {ticket.aiStatus === 'DONE' && !draft && !draftMut.isPending && (
        <div className="card p-4 flex items-center justify-between border-primary-200">
          <span className="text-sm text-text-muted">No AI draft yet for this ticket.</span>
          <Button size="sm" onClick={() => draftMut.mutate()} loading={draftMut.isPending}>
            <Sparkles size={13} /> Generate Draft
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="card overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-text-muted hover:text-text-base'
                }`}
            >
              {tab === 'Conversation'    && <MessageSquare size={14} />}
              {tab === 'Internal Notes'  && <StickyNote    size={14} />}
              {tab === 'Author Info'     && <User          size={14} />}
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Conversation tab ─────────────────────────── */}
          {activeTab === 'Conversation' && (
            <div className="space-y-4">
              {ticket.messages?.length === 0 && (
                <p className="text-sm text-text-muted text-center py-6">No replies yet.</p>
              )}
              {ticket.messages?.map((msg) => {
                const isAdmin = msg.senderRole === 'ADMIN'
                return (
                  <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    <Avatar name={msg.senderName || (isAdmin ? 'Admin' : ticket.author?.name)} size="sm" />
                    <div className={`max-w-[75%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`
                        rounded-2xl px-4 py-3 text-sm leading-relaxed
                        ${isAdmin
                          ? 'bg-primary-500 text-white rounded-tr-sm'
                          : 'bg-surface-alt text-text-base border border-border rounded-tl-sm'
                        }
                      `}>
                        {msg.body}
                      </div>
                      <p className="text-[11px] text-text-light mt-1 px-1">
                        {msg.senderName} · {fmtDateTime(msg.createdAt)}
                        {msg.wasAiDrafted && <span className="ml-1 text-primary-400">· AI-assisted</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />

              {/* Reply box */}
              {ticket.status !== 'CLOSED' && (
                <div className="pt-4 border-t border-border space-y-3">
                  {editingDraft && (
                    <div className="flex items-center gap-2 text-xs text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">
                      <Sparkles size={12} /> Using AI draft — edit before sending
                      <button onClick={() => { setReply(''); setEditingDraft(false) }} className="ml-auto">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <textarea
                    className="input resize-none"
                    rows={4}
                    placeholder="Type your reply…"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => draftMut.mutate()}
                      loading={draftMut.isPending}
                    >
                      <Sparkles size={13} />
                      {draft ? 'Regenerate' : 'AI Draft'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => reply.trim() && replyMut.mutate(reply.trim())}
                      loading={replyMut.isPending}
                      disabled={!reply.trim()}
                    >
                      <Send size={13} /> Send Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Internal Notes tab ───────────────────────── */}
          {activeTab === 'Internal Notes' && (
            <div className="space-y-4">
              <p className="text-xs text-text-muted bg-warning-light border border-warning/20
                            rounded-lg px-3 py-2">
                Internal notes are never visible to the author.
              </p>

              {ticket.internalNotes?.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">No notes yet.</p>
              )}

              {ticket.internalNotes?.map((n) => (
                <div key={n.id} className="bg-warning-light/40 border border-warning/20 rounded-lg p-4">
                  <p className="text-sm text-text-base whitespace-pre-wrap">{n.body}</p>
                  <p className="text-xs text-text-muted mt-2">{n.adminName} · {fmtDateTime(n.createdAt)}</p>
                </div>
              ))}

              <div className="pt-2 space-y-2">
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Add an internal note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => note.trim() && noteMut.mutate(note.trim())}
                  loading={noteMut.isPending}
                  disabled={!note.trim()}
                >
                  <StickyNote size={13} /> Add Note
                </Button>
              </div>
            </div>
          )}

          {/* ── Author Info tab ──────────────────────────── */}
          {activeTab === 'Author Info' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={ticket.author?.name} size="lg" />
                <div>
                  <p className="font-semibold text-text-base">{ticket.author?.name}</p>
                  <p className="text-xs text-text-muted">{ticket.author?.email}</p>
                </div>
              </div>

              {ticket.book && (
                <div className="bg-surface-alt border border-border rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-text-base">
                    {ticket.book.title}
                    <span className="ml-2 text-xs font-normal text-text-muted">{ticket.book.statusLabel}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Copies Sold',  value: ticket.book.copiesSold?.toLocaleString('en-IN') || '—' },
                      { label: 'Total Earned', value: fmtRupee(ticket.book.royaltyEarned)  },
                      { label: 'Royalty Paid', value: fmtRupee(ticket.book.royaltyPaid)    },
                      { label: 'Pending',      value: fmtRupee(ticket.book.royaltyPending) },
                      { label: 'Last Payout',  value: fmtDate(ticket.book.lastPayoutDate)  },
                      { label: 'Print Partner',value: ticket.book.printPartner || '—'      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-text-muted">{label}</p>
                        <p className="font-medium text-text-base">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!ticket.book && (
                <p className="text-sm text-text-muted">This is a general / account-level query — no specific book.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminTicketDetail

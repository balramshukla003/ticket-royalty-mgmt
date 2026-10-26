import { useState, useEffect, useRef } from 'react'
import { useParams, Link }  from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ticketApi from '../../api/ticket.api.js'
import Badge     from '../../components/ui/Badge.jsx'
import Button    from '../../components/ui/Button.jsx'
import Avatar    from '../../components/ui/Avatar.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { useAuth }  from '../../context/AuthContext.jsx'
import { useSocket } from '../../context/SocketContext.jsx'
import { useToast }  from '../../context/ToastContext.jsx'
import { fmtDateTime, fmtDate } from '../../utils/helpers.js'
import { ArrowLeft, Send } from 'lucide-react'

const AuthorTicketDetail = () => {
  const { id }         = useParams()
  const { user }       = useAuth()
  const { joinTicket, leaveTicket } = useSocket()
  const queryClient    = useQueryClient()
  const toast          = useToast()
  const bottomRef      = useRef(null)
  const [reply, setReply] = useState('')

  const ticketId = parseInt(id)

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn:  () => ticketApi.getTicketById(ticketId),
    refetchInterval: 15000,
  })

  // Join socket room for this ticket
  useEffect(() => {
    joinTicket(ticketId)
    return () => leaveTicket(ticketId)
  }, [ticketId])

  // Scroll to bottom when messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.data?.messages?.length])

  const replyMutation = useMutation({
    mutationFn: (body) => ticketApi.reply(ticketId, { body }),
    onSuccess: () => {
      setReply('')
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    },
    onError: (err) => toast({ type: 'error', title: 'Failed to send', message: err.message }),
  })

  if (isLoading) return <PageSpinner />

  const ticket   = data?.data
  if (!ticket) return <p className="text-text-muted p-6">Ticket not found.</p>

  const isClosed = ticket.status === 'CLOSED'

  return (
    <div className="max-w-3xl space-y-5">
      {/* Back */}
      <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-600">
        <ArrowLeft size={15} /> Back to tickets
      </Link>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-text-base">{ticket.subject}</h1>
            <p className="text-xs text-text-muted mt-1">
              {ticket.ticketCode} · {ticket.categoryLabel} · Opened {fmtDate(ticket.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={ticket.priority} label={ticket.priority} />
            <Badge variant={ticket.status} />
          </div>
        </div>

        {/* Book info */}
        {ticket.book && (
          <div className="mt-4 text-xs text-text-muted bg-surface-alt border border-border
                          rounded-lg px-4 py-2">
            Book: <span className="font-medium text-text-base">{ticket.book.title}</span>
            {' '} · {ticket.book.statusLabel}
          </div>
        )}

        {/* Original description */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-text-muted font-medium mb-2">Your query</p>
          <p className="text-sm text-text-base whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </p>
        </div>
      </div>

      {/* Conversation */}
      {ticket.messages?.length > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-text-base text-sm">Responses</h2>
          <div className="space-y-4">
            {ticket.messages.map((msg) => {
              const isOwn = msg.senderRole === 'AUTHOR'
              return (
                <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  <Avatar name={msg.senderName || (isOwn ? user.name : 'Support')} size="sm" />
                  <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`
                      rounded-2xl px-4 py-3 text-sm leading-relaxed
                      ${isOwn
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-surface-alt text-text-base border border-border rounded-tl-sm'
                      }
                    `}>
                      {msg.body}
                    </div>
                    <p className="text-[11px] text-text-light mt-1 px-1">
                      {msg.senderRole === 'ADMIN' ? 'BookLeaf Support' : 'You'} · {fmtDateTime(msg.createdAt)}
                      {msg.wasAiDrafted && (
                        <span className="ml-1 text-primary-400">· AI-assisted</span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div ref={bottomRef} />
        </div>
      )}

      {/* Reply box */}
      {!isClosed && (
        <div className="card p-5">
          <label className="label">Your reply</label>
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="Type your reply here…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={() => reply.trim() && replyMutation.mutate(reply.trim())}
              loading={replyMutation.isPending}
              disabled={!reply.trim()}
            >
              <Send size={14} /> Send Reply
            </Button>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="text-center py-4 text-sm text-text-muted bg-surface-alt
                        border border-border rounded-lg">
          This ticket is closed. Submit a new query if you need further help.
        </div>
      )}
    </div>
  )
}

export default AuthorTicketDetail

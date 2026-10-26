import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext.jsx'
import notificationApi from '../api/notification.api.js'
import { fmtRelative } from '../utils/helpers.js'
import { BellOff, CheckCheck } from 'lucide-react'

const NotificationDropdown = ({ onClose }) => {
  const { isAdmin }    = useAuth()
  const navigate       = useNavigate()
  const queryClient    = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationApi.getAll(),
  })

  const markAll = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const markOne = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const notifications = data?.data || []

  const handleClick = (n) => {
    if (!n.isRead) markOne.mutate(n.id)
    if (n.ticketId) {
      navigate(isAdmin ? `/admin/tickets/${n.ticketId}` : `/tickets/${n.ticketId}`)
    }
    onClose()
  }

  return (
    <>
      {/* Click-outside backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      <div className="absolute right-0 top-12 w-80 card shadow-modal z-40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-text-base">Notifications</span>
          <button
            onClick={() => markAll.mutate()}
            className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {isLoading && (
            <div className="p-6 text-center text-sm text-text-muted">Loading…</div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="p-8 flex flex-col items-center gap-2 text-text-muted">
              <BellOff size={22} />
              <span className="text-sm">No notifications</span>
            </div>
          )}

          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 hover:bg-surface-alt transition-colors
                          ${!n.isRead ? 'bg-primary-50' : ''}`}
            >
              <p className={`text-sm ${!n.isRead ? 'font-semibold text-text-base' : 'text-text-muted'}`}>
                {n.title}
              </p>
              {n.body && (
                <p className="text-xs text-text-muted mt-0.5 truncate">{n.body}</p>
              )}
              <p className="text-[11px] text-text-light mt-1">{fmtRelative(n.createdAt)}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default NotificationDropdown

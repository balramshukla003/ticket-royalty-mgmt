import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Ticket, LogOut, Bell, ShieldCheck } from 'lucide-react'
import { useAuth }  from '../context/AuthContext.jsx'
import { useQuery } from '@tanstack/react-query'
import notificationApi from '../api/notification.api.js'
import Avatar       from '../components/ui/Avatar.jsx'
import NotificationDropdown from '../components/NotificationDropdown.jsx'
import { useState } from 'react'

const NAV = [
  { to: '/admin/tickets', label: 'Ticket Queue', icon: Ticket },
]

const AdminLayout = () => {
  const { user, logout }     = useAuth()
  const navigate             = useNavigate()
  const [showNotif, setShowNotif] = useState(false)

  const { data: countData } = useQuery({
    queryKey: ['unread-count'],
    queryFn:  () => notificationApi.getUnreadCount(),
    refetchInterval: 15000,
  })
  const unread = countData?.data?.count || 0

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-60 bg-surface border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border gap-2">
          <ShieldCheck size={20} className="text-primary-600" />
          <span className="text-xl font-bold text-primary-600">BookLeaf</span>
          <span className="ml-1 text-xs text-text-muted font-medium bg-primary-50 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-text-muted hover:bg-surface-alt hover:text-text-base'
                }`
              }
            >
              <Icon size={18} />
              {label}
              {unread > 0 && to === '/admin/tickets' && (
                <span className="ml-auto bg-danger text-white text-[10px] font-bold
                                 rounded-full w-4 h-4 flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-base truncate">{user?.name}</p>
              <p className="text-xs text-text-muted capitalize truncate">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted
                       hover:bg-surface-alt hover:text-danger rounded-lg transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
          <h1 className="text-sm font-semibold text-text-muted">Operations Dashboard</h1>
          <div className="relative">
            <button
              onClick={() => setShowNotif((v) => !v)}
              className="relative btn-ghost p-2 rounded-lg"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white
                                 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            {showNotif && <NotificationDropdown onClose={() => setShowNotif(false)} />}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

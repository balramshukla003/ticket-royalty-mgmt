import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

import LoginPage            from '../pages/auth/LoginPage.jsx'
import AuthorLayout         from '../layouts/AuthorLayout.jsx'
import AdminLayout          from '../layouts/AdminLayout.jsx'
import DashboardPage        from '../pages/author/DashboardPage.jsx'
import MyBooksPage          from '../pages/author/MyBooksPage.jsx'
import SubmitTicketPage     from '../pages/author/SubmitTicketPage.jsx'
import MyTicketsPage        from '../pages/author/MyTicketsPage.jsx'
import AuthorTicketDetail   from '../pages/author/TicketDetailPage.jsx'
import AdminTicketQueue     from '../pages/admin/TicketQueuePage.jsx'
import AdminTicketDetail    from '../pages/admin/TicketDetailPage.jsx'

// ── Redirects to /login if not authenticated ──────────────
const RequireAuth = ({ children }) => {
  const { user }   = useAuth()
  const location   = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// ── Redirects to correct portal if wrong role ─────────────
const RequireRole = ({ role, children }) => {
  const { user } = useAuth()
  if (user?.role !== role && !(role === 'ADMIN' && user?.role === 'SUPER_ADMIN')) {
    return <Navigate to={user?.role === 'AUTHOR' ? '/dashboard' : '/admin/tickets'} replace />
  }
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === 'AUTHOR' ? '/dashboard' : '/admin/tickets'} replace />
            : <LoginPage />
        }
      />

      {/* Author portal */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <RequireRole role="AUTHOR">
              <AuthorLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"       element={<DashboardPage />} />
        <Route path="books"           element={<MyBooksPage />} />
        <Route path="tickets"         element={<MyTicketsPage />} />
        <Route path="tickets/new"     element={<SubmitTicketPage />} />
        <Route path="tickets/:id"     element={<AuthorTicketDetail />} />
      </Route>

      {/* Admin portal */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole role="ADMIN">
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/tickets" replace />} />
        <Route path="tickets"     element={<AdminTicketQueue />} />
        <Route path="tickets/:id" element={<AdminTicketDetail />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes

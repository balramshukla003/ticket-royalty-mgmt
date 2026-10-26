import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'
import { useQueryClient } from '@tanstack/react-query'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { token, user }    = useAuth()
  const toast              = useToast()
  const queryClient        = useQueryClient()
  const socketRef          = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token || !user) return

    const socket = io(import.meta.env.VITE_SOCKET_URL || '', {
      auth:              { token },
      transports:        ['websocket', 'polling'],
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    // ── Ticket events ──────────────────────────────────────
    socket.on('ticket:created', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
    })

    socket.on('ticket:message', ({ ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
    })

    socket.on('ticket:status_changed', ({ ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
    })

    socket.on('ticket:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
    })

    socket.on('ticket:assigned', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
    })

    socket.on('ticket:ai_completed', ({ ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      toast({ type: 'info', title: 'AI classification ready', duration: 3000 })
    })

    socket.on('ticket:ai_failed', ({ ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] })
      toast({ type: 'warning', title: 'AI unavailable', message: 'Classify this ticket manually.', duration: 6000 })
    })

    // ── Notification events ────────────────────────────────
    socket.on('notification:new', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
      toast({
        type:    'info',
        title:   notification.title,
        message: notification.body,
        duration: 5000,
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [token, user])

  const joinTicket = (ticketId) => {
    socketRef.current?.emit('ticket:join', { ticketId })
  }

  const leaveTicket = (ticketId) => {
    socketRef.current?.emit('ticket:leave', { ticketId })
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinTicket, leaveTicket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider')
  return ctx
}

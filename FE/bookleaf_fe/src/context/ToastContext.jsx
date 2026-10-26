import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

const ICONS = {
  success: <CheckCircle size={16} className="text-success" />,
  error:   <AlertCircle  size={16} className="text-danger"  />,
  warning: <AlertTriangle size={16} className="text-warning" />,
  info:    <Info          size={16} className="text-info"    />,
}

const BG = {
  success: 'border-l-4 border-success',
  error:   'border-l-4 border-danger',
  warning: 'border-l-4 border-warning',
  info:    'border-l-4 border-info',
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, type, title, message }])
    if (duration > 0) setTimeout(() => remove(id), duration)
  }, [remove])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              card px-4 py-3 flex items-start gap-3
              pointer-events-auto shadow-modal
              animate-[slideIn_0.2s_ease-out]
              ${BG[t.type] || BG.info}
            `}
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.type]}</span>
            <div className="flex-1 min-w-0">
              {t.title   && <p className="text-sm font-semibold text-text-base">{t.title}</p>}
              {t.message && <p className="text-xs text-text-muted mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 text-text-light hover:text-text-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx.toast
}

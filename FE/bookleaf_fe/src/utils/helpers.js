// Format date to "12 Oct 2026"
export const fmtDate = (date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

// Format date + time
export const fmtDateTime = (date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

// Format currency as ₹1,234
export const fmtRupee = (val) => {
  if (val === null || val === undefined) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)
}

// Relative time: "2 hours ago"
export const fmtRelative = (date) => {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return fmtDate(date)
}

// First name only
export const firstName = (name) => name?.split(' ')[0] || ''

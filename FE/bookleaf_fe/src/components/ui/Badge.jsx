const VARIANTS = {
  // Priority
  CRITICAL:    'bg-danger-light   text-danger-dark  border border-danger/20',
  HIGH:        'bg-warning-light  text-warning-dark border border-warning/20',
  MEDIUM:      'bg-info-light     text-info-dark    border border-info/20',
  LOW:         'bg-surface-alt    text-text-muted   border border-border',
  // Status
  OPEN:        'bg-warning-light  text-warning-dark border border-warning/20',
  IN_PROGRESS: 'bg-info-light     text-info-dark    border border-info/20',
  RESOLVED:    'bg-success-light  text-success-dark border border-success/20',
  CLOSED:      'bg-surface-alt    text-text-muted   border border-border',
  // Generic
  primary:     'bg-primary-100   text-primary-700  border border-primary-200',
  default:     'bg-surface-alt   text-text-muted   border border-border',
}

const LABELS = {
  IN_PROGRESS: 'In Progress',
}

const Badge = ({ variant = 'default', label, className = '' }) => {
  const cls = VARIANTS[variant] || VARIANTS.default
  const text = label ?? (LABELS[variant] || variant)
  return (
    <span className={`badge ${cls} ${className}`}>
      {text}
    </span>
  )
}

export default Badge

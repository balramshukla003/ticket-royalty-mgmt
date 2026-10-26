const StatCard = ({ label, value, sub, icon: Icon, accent = 'primary' }) => {
  const accentCls = {
    primary: 'bg-primary-50 text-primary-500',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    danger:  'bg-danger-light text-danger',
    info:    'bg-info-light text-info',
  }[accent] || 'bg-primary-50 text-primary-500'

  return (
    <div className="card p-5 flex items-center gap-4">
      {Icon && (
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${accentCls}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-text-base leading-tight">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default StatCard

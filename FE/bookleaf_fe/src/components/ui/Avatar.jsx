const COLORS = [
  'bg-primary-200 text-primary-700',
  'bg-success-light text-success-dark',
  'bg-warning-light text-warning-dark',
  'bg-info-light text-info-dark',
]

const Avatar = ({ name = '?', size = 'md' }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')

  const color = COLORS[name.charCodeAt(0) % COLORS.length]

  const sizeCls = {
    sm:  'w-7 h-7 text-xs',
    md:  'w-9 h-9 text-sm',
    lg:  'w-12 h-12 text-base',
  }[size] || 'w-9 h-9 text-sm'

  return (
    <div className={`rounded-full flex items-center justify-center font-semibold shrink-0 ${sizeCls} ${color}`}>
      {initials}
    </div>
  )
}

export default Avatar

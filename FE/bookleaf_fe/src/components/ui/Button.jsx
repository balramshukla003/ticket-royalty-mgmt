import { Loader2 } from 'lucide-react'

const Button = ({
  children,
  variant   = 'primary',
  size      = '',
  loading   = false,
  disabled  = false,
  className = '',
  ...props
}) => {
  const variantCls = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
    ghost:     'btn-ghost',
  }[variant] || 'btn-primary'

  const sizeCls = { sm: 'btn-sm', lg: 'btn-lg' }[size] || ''

  return (
    <button
      className={`${variantCls} ${sizeCls} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

export default Button

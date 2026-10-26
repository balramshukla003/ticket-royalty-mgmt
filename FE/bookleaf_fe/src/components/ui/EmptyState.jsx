import { Inbox } from 'lucide-react'

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
      <Icon size={26} className="text-primary-400" />
    </div>
    <h3 className="text-base font-semibold text-text-base mb-1">{title}</h3>
    {description && <p className="text-sm text-text-muted max-w-xs mb-4">{description}</p>}
    {action && action}
  </div>
)

export default EmptyState

import { Loader2 } from 'lucide-react'

const Spinner = ({ size = 24, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 size={size} className="animate-spin text-primary-500" />
  </div>
)

export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Spinner size={40} />
  </div>
)

export default Spinner

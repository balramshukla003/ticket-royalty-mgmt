import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Input   from '../../components/ui/Input.jsx'
import Button  from '../../components/ui/Button.jsx'
import { BookOpen, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await login(form)
      navigate(user.role === 'AUTHOR' ? '/dashboard' : '/admin/tickets', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4">
            <BookOpen size={28} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-text-base">BookLeaf</h1>
          <p className="text-text-muted text-sm mt-1">Author Support Portal</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-lg font-semibold text-text-base mb-6">Sign in to your account</h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@email.com"
              required
              autoFocus
            />

            <div className="w-full">
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  required
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-base"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger-light border border-danger/20
                            rounded-lg px-4 py-2">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs font-medium text-text-muted mb-2">Demo credentials</p>
            <div className="space-y-1 text-xs text-text-muted font-mono">
              <p>Admin: admin@bookleaf.com / 123456</p>
              <p>Author: priya.sharma@email.com / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

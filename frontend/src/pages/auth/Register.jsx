import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ name, email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-1">Tạo tài khoản</h1>
        <p className="text-sm text-muted-foreground mb-6">Bắt đầu hành trình đồng sở hữu xe điện</p>
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Họ và tên</label>
            <input className="mt-1 w-full border border-border rounded-lg p-2" value={name} onChange={e=>setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input className="mt-1 w-full border border-border rounded-lg p-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-medium">Mật khẩu</label>
            <input className="mt-1 w-full border border-border rounded-lg p-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>{loading ? 'Đang tạo...' : 'Đăng ký'}</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">Đã có tài khoản? <Link to="/login" className="text-primary hover:underline">Đăng nhập</Link></p>
      </div>
    </div>
  )
}

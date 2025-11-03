import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Zap, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/auth'

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/booking', label: 'Đặt lịch' },
  { to: '/vehicle', label: 'Xe' },
  { to: '/group', label: 'Nhóm' },
  { to: '/cost', label: 'Chi phí' },
  { to: '/contract', label: 'Hợp đồng' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="font-bold">EV Co-own</div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}`}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">{user.email || user.name}</span>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Vào app</Button>
                <Button variant="ghost" onClick={() => { logout(); if (pathname !== '/') navigate('/') }}>Đăng xuất</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>Đăng nhập</Button>
                <Button variant="hero" onClick={() => navigate('/register')}>Đăng ký</Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-accent" onClick={() => setOpen(!open)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {open && (
          <div className="md:hidden py-3 space-y-2 border-t border-border">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className="block py-2" onClick={() => setOpen(false)}>
                {n.label}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Button className="w-full" variant="outline" onClick={() => { setOpen(false); navigate('/dashboard') }}>Vào app</Button>
                  <Button className="w-full" variant="ghost" onClick={() => { setOpen(false); logout(); if (pathname !== '/') navigate('/') }}>Đăng xuất</Button>
                </>
              ) : (
                <>
                  <Button className="w-full" variant="ghost" onClick={() => { setOpen(false); navigate('/login') }}>Đăng nhập</Button>
                  <Button className="w-full" variant="hero" onClick={() => { setOpen(false); navigate('/register') }}>Đăng ký</Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

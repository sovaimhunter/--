import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSession, useSignOut } from '../lib/auth'
import './MainLayout.css'

const navItems = [
  { path: '/', label: '首页' },
  { path: '/algorithm', label: '算法' },
  { path: '/course', label: '课程' },
  { path: '/blog', label: '博客' },
]

export default function MainLayout() {
  const { user, loading } = useSession()
  const signOut = useSignOut()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut.mutate(undefined, {
      onSuccess: () => navigate('/login'),
    })
  }

  return (
    <>
      <nav className="main-nav">
        <div className="nav-inner">
          <span className="nav-logo">学习平台</span>
          <ul className="nav-links">
            {navItems.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  end={path === '/'}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="nav-auth">
            {loading ? null : user ? (
              <button className="auth-btn" onClick={handleSignOut}>
                登出
              </button>
            ) : (
              <NavLink to="/login" className="auth-btn">
                登录
              </NavLink>
            )}
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </>
  )
}

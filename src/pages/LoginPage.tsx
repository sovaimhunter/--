import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignIn } from '../lib/auth'
import './LoginPage.css'

export default function LoginPage() {
  const signIn = useSignIn()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    signIn.mutate({ email, password }, {
      onSuccess: () => navigate('/'),
      onError: (err) => setError(err.message),
    })
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>登录</h1>

        {error && <p className="login-message">{error}</p>}

        <label>
          邮箱
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          密码
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        <button type="submit" disabled={signIn.isPending}>
          {signIn.isPending ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  )
}

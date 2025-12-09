import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import DarkModeToggle from '../components/DarkModeToggle';
import '../App.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      localStorage.setItem('isAuthenticated', 'true');
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      // Redirecionar para a página do jogo
      navigate('/game');
    } else {
      setError(result.error || 'Falha ao fazer login');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="app--centered">
      {/* <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <DarkModeToggle />
      </div> */}
      <div className="login-container">
        <div className="panel login-panel">
          {/* Header */}
          <div className="login-header">
            <h1>Mapix</h1>
            <p>Descubra o mundo ao seu redor</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-field">
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-field" style={{ marginTop: '1rem' }}>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input with-icon-right"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-action"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: '#fee', 
                border: '1px solid #fcc',
                borderRadius: '0.5rem',
                color: '#c33'
              }}>
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <div style={{ textAlign: 'right' }}>
                <a href="#" className="link">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="primary full-width"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-muted">
              Não tem uma conta?{' '}
              <a href="#" className="link">
                Criar conta
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

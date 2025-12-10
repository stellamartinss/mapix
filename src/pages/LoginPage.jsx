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
    <div className="min-h-screen grid place-items-center text-center p-6">
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-[420px]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl shadow-slate-900/10 border border-slate-200 dark:border-slate-700 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center mb-2">
            <h1 className="m-0 mb-2 text-slate-900 dark:text-slate-100">Mapix</h1>
            <p className="m-0 text-slate-500 dark:text-slate-400">Descubra o mundo ao seu redor</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-slate-400 pointer-events-none" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 pl-10 pr-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-slate-400 pointer-events-none" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 pl-10 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 transition-all focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:shadow-[0_0_0_3px_rgba(66,133,244,0.1)] dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 bg-transparent border-none p-1.5 text-slate-400 cursor-pointer rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="text-right">
                <a href="#" className="text-blue-500 hover:text-blue-600 no-underline transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-br from-blue-500 to-green-500 dark:from-blue-600 dark:to-green-600 text-white border border-blue-500 dark:border-blue-600 rounded-lg transition-all hover:translate-y-[-1px] hover:bg-gradient-to-br hover:from-blue-600 hover:to-green-600 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Não tem uma conta?{' '}
              <a href="#" className="text-blue-500 hover:text-blue-600 no-underline transition-colors">
                Criar conta
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

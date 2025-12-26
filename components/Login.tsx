import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Logo from './shared/Logo';
import { Input } from './shared/Input';
import { Button } from './shared/Button';
import { AuthLayout } from './shared/AuthLayout';

interface Props {
  onSwitchToRegister: () => void;
}

const Login: React.FC<Props> = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (!user) {
        setError('Usuário ou senha inválidos.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Invalid login credentials') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(err.message || 'Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center space-y-2">
        <Logo />
        <h2 className="text-2xl font-bold text-primary">Bem-vindo de volta</h2>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-xl overflow-hidden space-y-4">
          <Input
            id="username"
            name="username"
            type="email"
            label="E-mail"
            autoComplete="email"
            required
            placeholder="Seu e-mail de acesso"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Senha"
            autoComplete="current-password"
            required
            placeholder="Sua senha secreta"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

        <Button type="submit" loading={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm pt-2">
        <a href="#" className="font-semibold text-accent hover:text-blue-700 transition-colors">
          Esqueceu a senha?
        </a>
        <button
          onClick={onSwitchToRegister}
          className="font-semibold text-accent hover:text-blue-700 transition-colors"
        >
          Novo cadastro
        </button>
      </div>
    </AuthLayout>
  );
};

export default Login;

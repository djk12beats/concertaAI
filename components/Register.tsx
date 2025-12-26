import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Logo from './shared/Logo';
import { Input } from './shared/Input';
import { Button } from './shared/Button';
import { AuthLayout } from './shared/AuthLayout';

interface Props {
    onSwitchToLogin: () => void;
}

const Register: React.FC<Props> = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        phone,
                    },
                },
            });

            if (signUpError) throw signUpError;

            setSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar (se necessário) ou faça login.');
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro no cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Link Conectar-me na parte superior */}
            <div className="absolute top-6 right-8">
                <button
                    onClick={onSwitchToLogin}
                    className="text-xs font-bold uppercase tracking-wider text-accent hover:text-blue-700 transition-colors"
                >
                    Conectar-me
                </button>
            </div>

            <div className="text-center space-y-2">
                <Logo />
                <p className="text-primary/60 text-sm font-semibold">
                    Soluções em reparos Residenciais e Comerciais
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-xl overflow-hidden space-y-4">
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        label="Nome Completo"
                        autoComplete="name"
                        required
                        placeholder="Nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        id="email-address"
                        name="email"
                        type="email"
                        label="E-mail"
                        autoComplete="email"
                        required
                        placeholder="Endereço de e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        label="Telefone"
                        autoComplete="tel"
                        required
                        placeholder="Telefone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        label="Senha"
                        autoComplete="new-password"
                        required
                        placeholder="Digite uma nova senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center font-medium">{success}</p>}

                <Button type="submit" loading={loading}>
                    {loading ? 'Cadastrando...' : 'Criar conta'}
                </Button>
            </form>

            <div className="flex items-center justify-center text-sm pt-2">
                <a href="#" className="font-semibold text-accent hover:text-blue-700 transition-colors">
                    Recuperar meu acesso
                </a>
            </div>
        </AuthLayout>
    );
};

export default Register;

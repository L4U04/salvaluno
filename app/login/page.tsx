'use client';
import React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Google from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

export default function Page() {
  const supabase = createClientComponentClient();

  const [form, setForm] = React.useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [emailNotConfirmed, setEmailNotConfirmed] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailNotConfirmed(false);
    setResendMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Seu email ainda não foi confirmado.');
          setEmailNotConfirmed(true);
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha inválidos.');
        } else {
          setError('Ocorreu um erro ao tentar fazer login.');
        }
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      console.error('Login error:', e);
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: form.email,
    });

    if (error) {
      setError('Ocorreu um erro ao reenviar o email.');
    } else {
      setResendMessage('Email de confirmação reenviado com sucesso!');
    }

    setResendLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 mb-0 ">
        <Image src={'/icons/SA.png'} alt="" width={250} height={10} />
      </div>
      <section className="w-[25rem] h-auto flex flex-col gap-8 items-center p-8 rounded-xl bg-sidebar border-2 border-zinc-50/5">
        <header className="flex flex-col items-center gap-1">
          <h1 className="font-inter font-medium text-2xl">
            Bem-vindo(a) de volta!
          </h1>
          <h3 className="text-zinc-400 text-center text-sm">
            Não tem uma conta ainda?
            <a
              href="/signup"
              className="ml-1 text-zinc-50/90 cursor-pointer hover:underline"
            >
              Registre-se
            </a>
          </h3>
        </header>
        <main className="w-full flex flex-col gap-2.5">
          <form className="flex flex-col gap-8 w-full" onSubmit={handleLogin}>
            <section className="flex flex-col gap-8">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Digite o seu email"
                  className="w-[100%]"
                  value={form.email}
                  onChange={e =>
                    setForm(f => ({ ...f, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid w-full items-center gap-1.5 relative">
                <Label htmlFor="password">Senha</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Digite a sua senha"
                  className="w-[100%] pr-10"
                  value={form.password}
                  onChange={e =>
                    setForm(f => ({ ...f, password: e.target.value }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2/3 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </section>
            {error && (
              <div className="text-red-400 text-xs text-center">{error}</div>
            )}
            {emailNotConfirmed && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                >
                  {resendLoading
                    ? 'Reenviando...'
                    : 'Reenviar email de confirmação'}
                </Button>
                {resendMessage && (
                  <div className="text-green-400 text-xs text-center">
                    {resendMessage}
                  </div>
                )}
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="w-full flex items-center gap-2">
            <hr className="w-[100%] text-zinc-50" />
            <p className="text-zinc-200/80 text-xs">OU</p>
            <hr className="w-[100%] text-zinc-50" />
          </div>
          <Button
            variant={'secondary'}
            className="w-full flex justify-center items-center gap-4"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Google size={24} />
            <p className="text-sm">Faça login com o google</p>
          </Button>
        </main>
      </section>
    </div>
  );
}

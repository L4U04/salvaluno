'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Cookies from 'js-cookie';
import Google from '@/components/icons/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';

// Interfaces para os dados
interface University {
  id: string;
  name: string;
}
interface Campus {
  id: string;
  name: string;
  university_id: string;
}

export default function SignUpPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Estados do formulário
  const [form, setForm] = React.useState({
    fullname: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = React.useState(false);

  // Estados para os seletores
  const [universities, setUniversities] = React.useState<University[]>([]);
  const [campuses, setCampuses] = React.useState<Campus[]>([]);
  const [filteredCampuses, setFilteredCampuses] = React.useState<Campus[]>([]);
  const [selectedUniversity, setSelectedUniversity] = React.useState('');
  const [selectedCampus, setSelectedCampus] = React.useState('');

  // Estados de UI
  const [loadingData, setLoadingData] = React.useState(true);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState('');

  // Busca inicial de dados
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [universitiesRes, campusesRes] = await Promise.all([
          supabase.from('universities').select('id, name').order('name'),
          supabase
            .from('campuses')
            .select('id, name, university_id')
            .order('name'),
        ]);

        if (universitiesRes.error) throw universitiesRes.error;
        if (campusesRes.error) throw campusesRes.error;

        setUniversities(universitiesRes.data || []);
        setCampuses(campusesRes.data || []);
      } catch (err: unknown) {
        setError(
          'Não foi possível carregar os dados das universidades e campi.',
        );
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error(err);
        }
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [supabase]);

  const handleUniversityChange = (universityId: string) => {
    setSelectedUniversity(universityId);
    const filtered = campuses.filter(
      campus => campus.university_id === universityId,
    );
    setFilteredCampuses(filtered);
    setSelectedCampus('');
  };

  const handleCampusChange = (campusId: string) => {
    setSelectedCampus(campusId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCampus) {
      setError('Por favor, selecione a sua universidade e o seu campus.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError('As senhas não coincidem!');
      return;
    }

    setIsRegistering(true);

    const { data, error: supabaseError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullname,
          campus_id: selectedCampus,
        },
      },
    });

    setIsRegistering(false);

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }

    if (data?.user && !data.user.email_confirmed_at) {
      setSuccess('Cadastro realizado! Por favor, confirme seu email.');
    } else {
      setSuccess('Cadastro realizado com sucesso!');
      router.push('/dashboard');
    }
  };

  const handleGoogleSignup = async () => {
    if (!selectedCampus) {
      setError('Por favor, selecione a sua universidade e o seu campus.');
      return;
    }
    setIsRegistering(true);
    setError('');

    Cookies.set('selected_campus_id', selectedCampus, { expires: 5 / 1440 });

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    setResendMessage('');
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: form.email,
    });
    setResendLoading(false);
    if (resendError) {
      setResendMessage('Erro ao reenviar email: ' + resendError.message);
    } else {
      setResendMessage(
        'Email de confirmação reenviado! Verifique sua caixa de entrada.',
      );
    }
  };

  return (
    <div className="flex justify-center items-start h-screen p-4 bg-[url('/icons/SA.png')] bg-no-repeat bg-top pt-[190px]">
      <section className="w-full max-w-md flex flex-col items-center gap-6 p-8 rounded-xl bg-sidebar border">
        <header className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-semibold text-2xl">Seja bem-vindo(a)!</h1>
          <h3 className="text-sm text-muted-foreground">
            Já tem uma conta?
            <a
              href="/login"
              className="ml-1 font-semibold text-primary hover:underline"
            >
              Entre
            </a>
          </h3>
        </header>
        <main className="w-full flex flex-col gap-4">
          <form
            className="flex flex-col gap-4 w-full"
            onSubmit={handleRegister}
          >
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="fullname">Seu Nome</Label>
              <Input
                id="fullname"
                name="fullname"
                placeholder="Digite o seu nome"
                value={form.fullname}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="university">Sua Universidade</Label>
              <Select
                value={selectedUniversity}
                onValueChange={handleUniversityChange}
                disabled={loadingData}
              >
                <SelectTrigger id="university">
                  <SelectValue
                    placeholder={
                      loadingData ? 'Carregando...' : 'Selecione a universidade'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(uni => (
                    <SelectItem key={uni.id} value={uni.id}>
                      {uni.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="campus">Seu Campus</Label>
              <Select
                value={selectedCampus}
                onValueChange={handleCampusChange}
                disabled={!selectedUniversity || filteredCampuses.length === 0}
                required
              >
                <SelectTrigger id="campus">
                  <SelectValue placeholder="Selecione o campus" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCampuses.map(campus => (
                    <SelectItem key={campus.id} value={campus.id}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu email"
                value={form.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid w-full items-center gap-1.5 relative">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite a sua senha"
                  value={form.password}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2/3 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="grid w-full items-center gap-1.5 relative">
                <Label htmlFor="passwordConfirm">Confirmar senha</Label>
                <Input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirme a senha"
                  value={form.passwordConfirm}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2/3 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            {success && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-green-500 text-center">{success}</p>
                {success.includes('confirme') && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Enviando...' : 'Reenviar email de confirmação'}
                    </Button>
                    {resendMessage && (
                      <p className="text-sm text-muted-foreground text-center">
                        {resendMessage}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            <Button type="submit" disabled={isRegistering}>
              {isRegistering ? 'Registrando...' : 'Registrar'}
            </Button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-sidebar px-2 text-muted-foreground">OU</span>
            </div>
          </div>

          <Button
            variant={'outline'}
            className="w-full flex justify-center items-center gap-2"
            onClick={handleGoogleSignup}
            disabled={isRegistering}
          >
            <Google size={18} />
            <p className="text-sm font-medium">Cadastre-se com o Google</p>
          </Button>
        </main>
      </section>
    </div>
  );
}
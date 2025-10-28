'use client';

import { IntelligentAvatar } from '@/components/ui/intelligent-avatar';
import {
  Eye,
  EyeOff,
  Upload,
  Loader2,
} from 'lucide-react';
import * as React from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface UserProfileProps {
  profile: {
    full_name?: string;
    avatar_url?: string;
    semestre_ingresso?: string;
  } | null;
  setProfile: React.Dispatch<
    React.SetStateAction<
      {
        full_name?: string;
        avatar_url?: string;
        semestre_ingresso?: string;
      } | null
    >
  >;
  loading: boolean;
  user: { id: string; email?: string; created_at?: string } | null;
}

export default function UserProfile({ profile, setProfile, loading, user }: UserProfileProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [showPassword, setShowPassword] = React.useState(false);
  const [inputSemester, setInputSemester] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState('');
  const [isPasswordChanging, setIsPasswordChanging] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  // Sincroniza o estado local do input com os dados do perfil que vêm do componente pai
  React.useEffect(() => {
    if (profile) {
      setInputSemester(profile.semestre_ingresso || '');
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const finalUrl = `${publicUrl}?t=${new Date().getTime()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: finalUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;

      // Chama a função do pai para atualizar o estado partilhado
      setProfile(prev => (prev ? { ...prev, avatar_url: finalUrl } : null));

      toast.success('Sucesso', {
        description: 'A sua imagem de perfil foi atualizada!',
      });
    } catch {
      toast.error('Erro', {
        description: 'Não foi possível atualizar a sua imagem de perfil.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!inputSemester || !user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ semestre_ingresso: inputSemester })
      .eq('id', user.id);

    if (error) {
      console.error('Erro ao atualizar o perfil:', error.message);
      toast.error('Erro', {
        description: 'Não foi possível salvar o semestre.',
      });
    } else {
      // Chama a função do pai para atualizar o estado partilhado
      setProfile(prev =>
        prev ? { ...prev, semestre_ingresso: inputSemester } : null,
      );
      setIsEditing(false);
      toast.success('Sucesso', {
        description: 'Semestre atualizado com sucesso!',
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setIsPasswordChanging(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) setPasswordError(error.message);
      else {
        setPasswordSuccess('Senha alterada com sucesso!');
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch {
      setPasswordError('Ocorreu um erro inesperado.');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  const handleRemoveAccount = async () => {
    setIsDeleting(true);
    try {
      if (!user) return;
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const result = await response.json();
      if (response.ok) {
        await supabase.auth.signOut();
        router.push('/login');
      } else {
        console.error('Erro ao remover conta:', result.error);
        toast.error('Erro', {
          description: 'Não foi possível remover a conta.',
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSwitchAccount = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Erro ao fazer logout:', error.message);
      else router.push('/login');
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Carregando...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Buscando informações do seu perfil...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const registrationDate = user && user.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <IntelligentAvatar
              fullName={profile?.full_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
              className="h-24 w-24 rounded-lg flex-shrink-0"
            />
            <div className="flex flex-col text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">
                {profile?.full_name || 'Utilizador'}
              </CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Mudar Foto
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
              accept="image/png, image/jpeg"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="font-semibold text-sm">Data de Registro:</p>
            <p className="text-muted-foreground">{registrationDate}</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-sm">Semestre de Ingresso:</p>
            {isEditing ? (
              <Input
                id="semestre"
                placeholder="Ex: 2024.1"
                value={inputSemester}
                onChange={e => setInputSemester(e.target.value)}
              />
            ) : (
              <p className="text-muted-foreground">
                {profile?.semestre_ingresso || 'N/A'}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {isEditing ? (
              <>
                <Button
                  onClick={handleUpdateProfile}
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar Semestre
              </Button>
            )}
            <Button variant="outline" onClick={handleSwitchAccount}>
              Trocar de Conta
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Removendo...' : 'Remover Conta'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Trocar Senha</Button>
              </DialogTrigger>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                    <DialogDescription>
                      Digite a sua nova senha abaixo.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="relative grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-password" className="text-right">
                        Nova Senha
                      </Label>
                      <div className="col-span-3 relative">
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          className="pr-10"
                          value={passwordForm.newPassword}
                          onChange={e =>
                            setPasswordForm(p => ({
                              ...p,
                              newPassword: e.target.value,
                            }))
                          }
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                          onClick={toggleShowPassword}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="relative grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="confirm-password" className="text-right">
                        Confirme
                      </Label>
                      <div className="col-span-3 relative">
                        <Input
                          id="confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          className="pr-10"
                          value={passwordForm.confirmPassword}
                          onChange={e =>
                            setPasswordForm(p => ({
                              ...p,
                              confirmPassword: e.target.value,
                            }))
                          }
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                          onClick={toggleShowPassword}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </span>
                      </div>
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-sm text-center">
                        {passwordError}
                      </p>
                    )}
                    {passwordSuccess && (
                      <p className="text-green-500 text-sm text-center">
                        {passwordSuccess}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isPasswordChanging}
                    >
                      {isPasswordChanging ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </motion.div>
            </Dialog>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

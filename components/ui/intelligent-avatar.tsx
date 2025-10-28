'use client';

import Image from 'next/image';
import {
  Avatar as ShadcnAvatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { User2 } from 'lucide-react';

// Função para extrair as iniciais de um nome
const getInitials = (name: string = '') => {
  const names = name.trim().split(' ');
  const firstNameInitial = names[0]?.[0] || '';
  const lastNameInitial = names.length > 1 ? names[names.length - 1]?.[0] : '';
  return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
};

interface IntelligentAvatarProps {
  fullName: string | null;
  avatarUrl: string | null;
  className?: string;
}

export function IntelligentAvatar({
  fullName,
  avatarUrl,
  className,
}: IntelligentAvatarProps) {
  // Se existir uma URL de avatar (vinda do Google, por exemplo), use-a.
  if (avatarUrl) {
    return (
      <ShadcnAvatar className={className}>
        <AvatarImage src={avatarUrl} alt={fullName || 'Avatar'} />
        <AvatarFallback>{getInitials(fullName || '')}</AvatarFallback>
      </ShadcnAvatar>
    );
  }

  // Se NÃO existir URL (cadastro por email), gere uma URL do ui-avatars.
  // URL-encode para garantir que nomes com espaços/acentos funcionem.
  const encodedName = encodeURIComponent(fullName || '');
  const avatarFallbackUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;

  return (
    <ShadcnAvatar className={className}>
      <AvatarImage src={avatarFallbackUrl} alt={fullName || 'Avatar'} />
      <AvatarFallback>
        <User2 className="h-8 w-8 text-gray-400" />
      </AvatarFallback>
    </ShadcnAvatar>
  );
}

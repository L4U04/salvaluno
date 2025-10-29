import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Pega a sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Se o usuário NÃO estiver logado e acessar a raiz (/)
  if (!session && pathname === '/') {
    // Redireciona para /signup
    return NextResponse.redirect(new URL('/signup', req.url));
  }

  // Se o usuário JÁ ESTIVER logado e acessar a raiz (/)
  if (session && pathname === '/') {
    // Redireciona para /dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Se o usuário NÃO estiver logado e tentar acessar /dashboard
  if (!session && pathname.startsWith('/dashboard')) {
    // Redireciona para /signup
    return NextResponse.redirect(new URL('/signup', req.url));
  }

  // Se o usuário JÁ ESTIVER logado e tentar acessar /signup
  if (session && pathname.startsWith('/signup')) {
    // Redireciona para /dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Deixa todas as outras requisições passarem
  return res;
}

// IMPORTANTE: Adicione o config no final
export const config = {
  matcher: [
    '/', // Rota raiz
    '/dashboard/:path*', // Rotas protegidas
    '/signup', // Rota de autenticação
    // Adicione aqui outras rotas que quer proteger
  ],
};
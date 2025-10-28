'use client';

import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

export default function FeedbackPage() {
  const supabase = createClientComponentClient();
  const [category, setCategory] = React.useState('Sugestão Premium');
  const [content, setContent] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (content.length < 10) {
      toast.error('Mensagem muito curta', {
        description: 'Por favor, descreva a sua sugestão com mais detalhes.',
      });
      return;
    }

    setLoading(true);

    try {
      // Pega o ID do utilizador logado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilizador não autenticado.');
      }

      // Insere os dados na tabela 'feedback'
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        category: category,
        content: content,
      });

      if (error) {
        throw error;
      }

      toast.success('Feedback Enviado!', {
        description:
          'Obrigado pela sua sugestão. A sua opinião é muito importante para nós.',
      });

      // Limpa o formulário após o envio
      setContent('');
    } catch (error: any) {
      console.error('Erro ao enviar feedback:', error);
      toast.error('Erro ao Enviar', {
        description:
          'Não foi possível enviar a sua sugestão. Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Envie a sua Sugestão</CardTitle>
            <CardDescription>
              Tem uma ideia para o plano Premium ou encontrou um problema?
              Adoraríamos ouvir a sua opinião!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Tipo de Feedback</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sugestão Premium">
                    Sugestão para o Plano Premium
                  </SelectItem>
                  <SelectItem value="Reportar Bug">
                    Reportar um Problema
                  </SelectItem>
                  <SelectItem value="Melhoria Geral">Melhoria Geral</SelectItem>
                  <SelectItem value="Outro">Outro Assunto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">A sua mensagem</Label>
              <Textarea
                id="content"
                placeholder="Descreva a sua sugestão ou o problema que encontrou com o máximo de detalhes possível..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="ml-auto">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {loading ? 'A Enviar...' : 'Enviar Feedback'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

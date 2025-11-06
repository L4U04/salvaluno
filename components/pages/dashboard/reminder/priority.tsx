'use client';

import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, BellRing } from 'lucide-react';

type Priority = 'alta' | 'media' | 'baixa';

interface ReminderItem {
  id: string; // Alterado de number para string para consistência com UUID
  text: string;
  subject?: string;
  date?: string;
  priority: Priority;
}

export default function PriorityCard() {
  // ---- INÍCIO DA MODIFICAÇÃO ----
  const [reminders, setReminders] = React.useState<ReminderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClientComponentClient();

  React.useEffect(() => {
    async function fetchReminders() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Busca os dados do Supabase
        const { data, error } = await supabase
          .from('reminders')
          .select('id, text, date, priority')
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao buscar lembretes:', error);
          setReminders([]);
        } else {
          setReminders(data || []);
        }
      } else {
        setReminders([]);
      }
      setLoading(false);
    }

    fetchReminders();
  }, [supabase]);
  // ---- FIM DA MODIFICAÇÃO ----

  const priorityReminders = reminders
    .filter(r => r.priority === 'alta')
    .slice(0, 2);

  // Usa o estado 'loading' em vez de 'hasMounted'
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellRing className="w-5 h-5" />
            Lembretes Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="w-4 h-4 mt-1" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <Skeleton className="w-4 h-4 mt-1" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing className="w-5 h-5" />
          Lembretes Importantes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {priorityReminders.length > 0 ? (
          <div className="space-y-3">
            {priorityReminders.map((reminder, index) => (
              <React.Fragment key={reminder.id}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 mt-1 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{reminder.text}</p>
                    <p className="text-sm text-muted-foreground">
                      {reminder.subject}
                      {reminder.subject && reminder.date ? ' - ' : ''}
                      {reminder.date
                        ? format(parseISO(reminder.date), 'PPP', {
                            locale: ptBR,
                          })
                        : ''}
                    </p>
                  </div>
                </div>
                {index < priorityReminders.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Nenhum lembrete de alta prioridade.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

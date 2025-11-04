'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  BellRing,
  CalendarIcon,
  Edit,
  Plus,
  Trash2,
} from 'lucide-react';
import * as React from 'react';

type Priority = 'alta' | 'media' | 'baixa';

interface ReminderItem {
  id: string;
  text: string;
  subject?: string;
  date?: string;
  priority: Priority;
}

const priorityOrder = {
  alta: 1,
  media: 2,
  baixa: 3,
};

const priorityStyles = {
  alta: 'bg-red-500/20',
  media: 'bg-yellow-500/20',
  baixa: 'bg-green-500/20',
};

export default function Bar() {
  const [reminders, setReminders] = React.useState<ReminderItem[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingReminder, setEditingReminder] =
    React.useState<ReminderItem | null>(null);
  const [reminderText, setReminderText] = React.useState('');
  const [reminderDate, setReminderDate] = React.useState<Date | undefined>();
  const [reminderPriority, setReminderPriority] =
    React.useState<Priority>('media');
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const supabase = createClientComponentClient();

  React.useEffect(() => {
    async function fetchUserAndData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const fetchedUserId = user ? user.id : null;
      setUserId(fetchedUserId);

      if (fetchedUserId) {
        const { data: remindersData, error } = await supabase
          .from('reminders')
          .select('id, text, date, priority')
          .eq('user_id', fetchedUserId);
        if (error) {
          console.error('Erro ao buscar lembretes:', error);
        } else {
          setReminders(remindersData || []);
        }
      }
      setIsLoaded(true);
    }
    fetchUserAndData();
  }, [supabase]);

  const sortedReminders = React.useMemo(() => {
    return [...reminders].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
  }, [reminders]);

  const handleSaveOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderText.trim() || !userId) return;

    const dateToSave = reminderDate ? reminderDate.toISOString() : undefined;

    try {
      if (editingReminder) {
        const { error } = await supabase
          .from('reminders')
          .update({
            text: reminderText,
            date: dateToSave,
            priority: reminderPriority,
          })
          .eq('id', editingReminder.id)
          .eq('user_id', userId);
        if (error) throw error;

        setReminders(
          reminders.map(r =>
            r.id === editingReminder.id
              ? {
                  ...r,
                  text: reminderText,
                  date: dateToSave,
                  priority: reminderPriority,
                }
              : r,
          ),
        );
      } else {
        const newReminder: ReminderItem = {
          id: userId,
          text: reminderText.trim(),
          date: dateToSave,
          priority: reminderPriority,
        };
        const { error } = await supabase.from('reminders').insert({
          id: newReminder.id,
          user_id: userId,
          text: newReminder.text,
          date: newReminder.date,
          priority: newReminder.priority,
        });
        if (error) throw error;

        setReminders([...reminders, newReminder]);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
    }
  };

  const handleEditClick = (reminder: ReminderItem) => {
    setEditingReminder(reminder);
    setReminderText(reminder.text);
    setReminderPriority(reminder.priority);
    if (reminder.date) {
      setReminderDate(parseISO(reminder.date));
    } else {
      setReminderDate(undefined);
    }
    setIsFormOpen(true);
  };

  const handleDeleteReminder = async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;

      setReminders(reminders.filter(reminder => reminder.id !== id));
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error);
    }
  };

  const resetForm = () => {
    setEditingReminder(null);
    setReminderText('');
    setReminderDate(undefined);
    setReminderPriority('media');
    setIsFormOpen(false);
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent>Carregando...</CardContent>
      </Card>
    );
  }

  return (
    <Sheet onOpenChange={open => !open && resetForm()}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <BellRing className="h-5 w-5" />
          <span className="sr-only">Lembretes</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Lembretes</SheetTitle>
          <SheetDescription>
            Gerencie suas tarefas e lembretes importantes aqui.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pt-4">
          <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {editingReminder
                  ? 'Editar Lembrete'
                  : 'Adicionar Novo Lembrete'}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <form onSubmit={handleSaveOrUpdate} className="space-y-4 pt-4">
                <Input
                  placeholder="Descrição do lembrete..."
                  value={reminderText}
                  onChange={e => setReminderText(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'flex-1 justify-start text-left font-normal',
                          !reminderDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reminderDate ? (
                          format(reminderDate, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Definir data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={reminderDate}
                        onSelect={setReminderDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Select
                    value={reminderPriority}
                    onValueChange={(value: Priority) =>
                      setReminderPriority(value)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <Separator className="my-4" />

        <div className="flex-1 overflow-y-auto px-6 space-y-3">
          {sortedReminders.length > 0 ? (
            sortedReminders.map(reminder => (
              <Card
                key={reminder.id}
                className={cn('group', priorityStyles[reminder.priority])}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {reminder.text}
                      </p>
                      {reminder.date && (
                        <p className="text-xs text-muted-foreground truncate">
                          {format(parseISO(reminder.date), 'PPP', {
                            locale: ptBR,
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditClick(reminder)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <AlertCircle className="w-10 h-10 mb-4" />
              <p className="font-semibold">Nenhum lembrete</p>
              <p className="text-sm">Use o botão acima para adicionar um.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

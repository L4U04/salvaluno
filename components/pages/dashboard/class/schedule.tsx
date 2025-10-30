'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { Check, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid'; // [NOVO] Importar a função de gerar UUID

type Day = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab';

interface ClassSession {
  id: string;
  subjectName: string;
  professor?: string | null;
  room?: string | null;
  day: Day;
  startTime: string;
  endTime: string;
  color: string;
}

const daysOfWeek: Day[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const timePoints = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
];
const timeRanges = timePoints.map((time, index) => {
  if (index === timePoints.length - 1) return `${time}-23:00`;
  return `${time}-${timePoints[index + 1]}`;
});
const classColors = [
  'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 border-l-4 border-sky-500',
  'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-l-4 border-red-500',
  'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-l-4 border-green-500',
  'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-500',
  'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-l-4 border-purple-500',
  'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border-l-4 border-pink-500',
  'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-l-4 border-orange-500',
  'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-l-4 border-indigo-500',
  'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 border-l-4 border-teal-500',
];

function DesktopSchedule({
  sessions,
  handleSessionClick,
  handleCellClick,
}: {
  sessions: ClassSession[];
  handleSessionClick: (s: ClassSession) => void;
  handleCellClick: (d: Day, t: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table className="border min-w-[800px] table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] border-r text-center">
              Horários
            </TableHead>
            {daysOfWeek.map(day => (
              <TableHead key={day} className="text-center w-[120px]">
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timePoints.map((time, timeIndex) => (
            <TableRow key={time}>
              <TableCell className="font-medium border-r text-xs text-muted-foreground text-center align-top pt-2 h-14">
                {timeRanges[timeIndex]}
              </TableCell>
              {daysOfWeek.map(day => {
                const isCovered = sessions.some(
                  s => s.day === day && s.startTime < time && s.endTime > time,
                );
                if (isCovered) return null;

                const session = sessions.find(
                  s => s.day === day && s.startTime === time,
                );

                if (session) {
                  const startIdx = timePoints.indexOf(session.startTime);
                  const endIdx = timePoints.indexOf(session.endTime);
                  const rowSpan = endIdx > startIdx ? endIdx - startIdx : 1;

                  return (
                    <TableCell
                      data-testid="add-class-cell"
                      key={session.id}
                      className="p-1 align-top relative"
                      rowSpan={rowSpan}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'absolute inset-1 flex flex-col rounded-md p-1 text-[10px] font-semibold overflow-hidden cursor-pointer',
                                session.color,
                              )}
                              onClick={() => handleSessionClick(session)}
                            >
                              <span className="font-bold truncate">
                                {session.subjectName}
                              </span>
                              <span className="truncate">
                                {session.professor}
                              </span>
                              <span className="text-muted-foreground truncate">
                                {session.room}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{session.subjectName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  );
                }

                return (
                  <TableCell
                    key={day}
                    className="p-1 h-14 text-center cursor-pointer hover:bg-muted/50 align-middle"
                    onClick={() => handleCellClick(day, time)}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground mx-auto" />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MobileSchedule({
  sessions,
  handleSessionClick,
  handleCellClick,
}: {
  sessions: ClassSession[];
  handleSessionClick: (s: ClassSession) => void;
  handleCellClick: (d: Day, t: string) => void;
}) {
  const sessionsByDay = daysOfWeek.map(day => ({
    day,
    sessions: sessions
      .filter((s: ClassSession) => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="space-y-6">
      {sessionsByDay.map(({ day, sessions }) => (
        <div key={day}>
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-semibold">{day}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleCellClick(day, '07:00')}
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session: ClassSession) => (
                <TooltipProvider key={session.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'flex items-center rounded-lg p-3 text-sm cursor-pointer',
                          session.color,
                        )}
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">
                            {session.subjectName}
                          </p>
                          <p className="truncate">{session.professor}</p>
                          <p className="text-muted-foreground truncate">
                            {session.room}
                          </p>
                        </div>
                        <div className="text-right ml-2 shrink-0">
                          <p className="font-mono text-xs">
                            {session.startTime}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {session.endTime}
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{session.subjectName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic px-1 pb-4 border-b border-dashed">
              Nenhuma aula neste dia.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function Schedule() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [sessions, setSessions] = React.useState<ClassSession[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [currentSession, setCurrentSession] =
    React.useState<Partial<ClassSession> | null>(null);
  const isMobile = useIsMobile();
  const supabase = createClientComponentClient();
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function fetchUserAndData() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) {
        console.error('Erro ao buscar usuário:', authError);
        toast.error('Erro de Autenticação', {
          description: 'Falha ao autenticar usuário.',
        });
        setIsLoaded(true);
        return;
      }

      const fetchedUserId = user ? user.id : null;
      setUserId(fetchedUserId);

      if (fetchedUserId) {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('classes')
          .select(
            'id, subject_name, professor, room, day, start_time, end_time, color',
          )
          .eq('user_id', fetchedUserId);
        if (sessionsError) {
          console.error('Erro ao buscar sessões:', sessionsError);
          toast.error('Erro ao Carregar', {
            description: 'Falha ao carregar horários.',
          });
        } else {
          const mappedSessions: ClassSession[] = sessionsData.map(s => ({
            id: s.id,
            subjectName: s.subject_name,
            professor: s.professor,
            room: s.room,
            day: s.day as Day,
            startTime: s.start_time,
            endTime: s.end_time,
            color: s.color,
          }));
          setSessions(mappedSessions || []);
        }
      }
      setIsLoaded(true);
    }
    fetchUserAndData();
  }, [supabase]);

  const handleCellClick = (day: Day, time: string) => {
    const endHour = String(Number(time.slice(0, 2)) + 2).padStart(2, '0');
    setCurrentSession({
      day,
      startTime: time,
      endTime: `${endHour}:00`,
      color: classColors[Math.floor(Math.random() * classColors.length)],
    });
    setIsDialogOpen(true);
  };

  const handleSessionClick = (session: ClassSession) => {
    setCurrentSession(session);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (
      !currentSession?.subjectName?.trim() ||
      !currentSession.day ||
      !currentSession.startTime ||
      !currentSession.endTime ||
      !currentSession.color ||
      !userId
    ) {
      toast.error('Erro de Validação', {
        description:
          'Preencha todos os campos obrigatórios (matéria, dia, horários e cor).',
      });
      return;
    }

    const conflict = sessions.some(
      s =>
        s.id !== currentSession.id &&
        s.day === currentSession.day &&
        ((currentSession.startTime !== undefined &&
          currentSession.startTime >= s.startTime &&
          currentSession.startTime < s.endTime) ||
          (currentSession.endTime !== undefined &&
            currentSession.endTime > s.startTime &&
            currentSession.endTime <= s.endTime) ||
          (currentSession.startTime !== undefined &&
            currentSession.endTime !== undefined &&
            currentSession.startTime <= s.startTime &&
            currentSession.endTime >= s.endTime)),
    );
    if (conflict) {
      toast.error('Conflito de Horário', {
        description:
          'Já existe uma aula neste horário. Por favor, escolha outro.',
      });
      return;
    }

    const subjectNameTrimmed = currentSession.subjectName.trim();
    let assignedColor = currentSession.color;

    if (!assignedColor) {
      const existingSession = sessions.find(
        s => s.subjectName.toLowerCase() === subjectNameTrimmed.toLowerCase(),
      );
      assignedColor =
        existingSession?.color ||
        classColors[Math.floor(Math.random() * classColors.length)];
    }

    const sessionData: ClassSession = {
      id: currentSession.id || uuidv4(),
      subjectName: subjectNameTrimmed,
      professor: currentSession.professor || null,
      room: currentSession.room || null,
      day: currentSession.day,
      startTime: currentSession.startTime,
      endTime: currentSession.endTime,
      color: assignedColor,
    };

    try {
      if (currentSession.id) {
        const { error } = await supabase
          .from('classes')
          .update({
            subject_name: sessionData.subjectName,
            professor: sessionData.professor,
            room: sessionData.room,
            day: sessionData.day,
            start_time: sessionData.startTime,
            end_time: sessionData.endTime,
            color: sessionData.color,
          })
          .eq('id', sessionData.id)
          .eq('user_id', userId);
        if (error) throw error;

        if (
          sessionData.color !==
          sessions.find(s => s.id === sessionData.id)?.color
        ) {
          await supabase
            .from('classes')
            .update({ color: sessionData.color })
            .eq('subject_name', sessionData.subjectName)
            .eq('user_id', userId);
        }

        setSessions(
          sessions.map(s => (s.id === sessionData.id ? sessionData : s)),
        );
      } else {
        const { error } = await supabase.from('classes').insert({
          id: sessionData.id,
          user_id: userId,
          subject_name: sessionData.subjectName,
          professor: sessionData.professor,
          room: sessionData.room,
          day: sessionData.day,
          start_time: sessionData.startTime,
          end_time: sessionData.endTime,
          color: sessionData.color,
        });
        if (error) throw error;

        setSessions([...sessions, sessionData]);
      }
      toast.success('Sucesso', { description: 'Horário salvo com sucesso!' });
      closeDialog();
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      toast.error('Erro ao Salvar', {
        description: 'Falha ao salvar o horário. Tente novamente.',
      });
    }
  };

  const handleDelete = async () => {
    if (!currentSession?.id || !userId) {
      toast.error('Erro Interno', {
        description: 'Não foi possível identificar a sessão ou usuário.',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', currentSession.id)
        .eq('user_id', userId);
      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== currentSession.id));
      toast.success('Sucesso', {
        description: 'Horário apagado com sucesso!',
      });

      closeDialog();
    } catch (error) {
      console.error('Erro ao apagar sessão:', error);
      toast.error('Erro', {
        description: 'Não foi possível apagar o horário.',
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentSession(null);
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Minha Grade de Horários</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <MobileSchedule
              sessions={sessions}
              handleSessionClick={handleSessionClick}
              handleCellClick={handleCellClick}
            />
          ) : (
            <DesktopSchedule
              sessions={sessions}
              handleSessionClick={handleSessionClick}
              handleCellClick={handleCellClick}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentSession?.id ? 'Editar Aula' : 'Adicionar Nova Aula'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subjectName">Nome da Matéria</Label>
              <Input
                id="subjectName"
                value={currentSession?.subjectName || ''}
                onChange={e =>
                  setCurrentSession({
                    ...currentSession,
                    subjectName: e.target.value,
                  })
                }
                placeholder="Ex: Cálculo I"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="professor">Professor</Label>
              <Input
                id="professor"
                value={currentSession?.professor || ''}
                onChange={e =>
                  setCurrentSession({
                    ...currentSession,
                    professor: e.target.value,
                  })
                }
                placeholder="Ex: Moacyr Miranda"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Sala ou Local</Label>
              <Input
                id="room"
                value={currentSession?.room || ''}
                onChange={e =>
                  setCurrentSession({ ...currentSession, room: e.target.value })
                }
                placeholder="Ex: PAV I SALA 11"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="day">Dia da Semana</Label>
              <Select
                value={currentSession?.day}
                onValueChange={(value: Day) =>
                  setCurrentSession({ ...currentSession, day: value })
                }
              >
                <SelectTrigger id="day">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(d => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Horário de Início</Label>
                <Select
                  value={currentSession?.startTime}
                  onValueChange={value =>
                    setCurrentSession({ ...currentSession, startTime: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timePoints.map(t => (
                      <SelectItem key={`start-${t}`} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Horário de Fim</Label>
                <Select
                  value={currentSession?.endTime}
                  onValueChange={value =>
                    setCurrentSession({ ...currentSession, endTime: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timePoints.map(t => (
                      <SelectItem key={`end-${t}`} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Cor da Matéria</Label>
              <div className="flex flex-wrap gap-2">
                {classColors.map(colorClass => (
                  <button
                    key={colorClass}
                    type="button"
                    className={cn('h-8 w-8 rounded-full border-2', colorClass)}
                    onClick={() =>
                      setCurrentSession({
                        ...currentSession,
                        color: colorClass,
                      })
                    }
                  >
                    {currentSession?.color === colorClass && (
                      <Check className="h-5 w-5 mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="justify-between">
            {currentSession?.id && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Deletar
              </Button>
            )}
            {!currentSession?.id && <div />}
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
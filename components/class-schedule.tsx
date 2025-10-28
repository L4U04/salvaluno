'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Check } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return isMobile;
};

// --- Estrutura de Dados ---
type Day = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab';

interface ClassSession {
  id: string;
  subjectName: string;
  professor?: string;
  room?: string;
  day: Day;
  startTime: string;
  endTime: string;
  color: string;
}

// --- Dados Estáticos ---
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
                      <div
                        className={cn(
                          'absolute inset-1 flex flex-col rounded-md p-1 text-[10px] font-semibold break-words cursor-pointer',
                          session.color,
                        )}
                        onClick={() => handleSessionClick(session)}
                      >
                        <span className="font-bold">{session.subjectName}</span>
                        <span className="">{session.professor}</span>
                        <span className="text-muted-foreground">
                          {session.room}
                        </span>
                      </div>
                    </TableCell>
                  );
                }

                return (
                  <TableCell
                    key={day}
                    className="p-1 h-14 text-center cursor-pointer hover:bg-muted/50 align-middle"
                    onClick={() => handleCellClick(day, time)}
                  >
                    <Plus className="w-4 h-4 text-muted-foreground mx-auto" />
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
                <div
                  key={session.id}
                  className={cn(
                    'flex items-center rounded-lg p-3 text-sm',
                    session.color,
                  )}
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{session.subjectName}</p>
                    <p className="truncate">{session.professor}</p>
                    <p className="text-muted-foreground truncate">
                      {session.room}
                    </p>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <p className="font-mono text-xs">{session.startTime}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {session.endTime}
                    </p>
                  </div>
                </div>
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

export default function ClassSchedule() {
  const [sessions, setSessions] = useLocalStorage<ClassSession[]>(
    'classSchedule',
    [],
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [currentSession, setCurrentSession] =
    React.useState<Partial<ClassSession> | null>(null);
  const isMobile = useIsMobile();

  const handleCellClick = (day: Day, time: string) => {
    const endHour = String(Number(time.slice(0, 2)) + 2).padStart(2, '0');
    setCurrentSession({ day, startTime: time, endTime: `${endHour}:00` });
    setIsDialogOpen(true);
  };

  const handleSessionClick = (session: ClassSession) => {
    setCurrentSession(session);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (
      !currentSession?.subjectName ||
      !currentSession.day ||
      !currentSession.startTime ||
      !currentSession.endTime
    )
      return;

    const subjectNameTrimmed = currentSession.subjectName.trim();
    const newColor = currentSession.color;

    if (currentSession.id) {
      const originalSession = sessions.find(s => s.id === currentSession.id);
      if (!originalSession) return;

      setSessions(
        sessions.map(s => {
          if (s.id === currentSession.id) {
            return {
              ...currentSession,
              subjectName: subjectNameTrimmed,
            } as ClassSession;
          }
          if (
            s.subjectName.toLowerCase() ===
              originalSession.subjectName.toLowerCase() &&
            newColor &&
            s.color !== newColor
          ) {
            return { ...s, color: newColor };
          }
          return s;
        }),
      );
    } else {
      let assignedColor = newColor;
      const existingSession = sessions.find(
        s => s.subjectName.toLowerCase() === subjectNameTrimmed.toLowerCase(),
      );

      if (existingSession) {
        assignedColor = existingSession.color;
      } else if (!assignedColor) {
        assignedColor =
          classColors[Math.floor(Math.random() * classColors.length)];
      }

      const newSession: ClassSession = {
        id: new Date().toISOString(),
        subjectName: subjectNameTrimmed,
        professor: currentSession.professor,
        room: currentSession.room,
        day: currentSession.day,
        startTime: currentSession.startTime,
        endTime: currentSession.endTime,
        color: assignedColor as string,
      };
      setSessions([...sessions, newSession]);
    }
    closeDialog();
  };

  const handleDelete = () => {
    if (!currentSession?.id) return;
    setSessions(sessions.filter(s => s.id !== currentSession.id));
    closeDialog();
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentSession(null);
  };

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

'use client';

import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, GraduationCap } from 'lucide-react';
import { differenceInMinutes, isBefore, set } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ClassSession {
  subjectName: string;
  professor?: string;
  room?: string;
  day: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sab';
  startTime: string;
  endTime: string;
  color: string;
}

const dayMapping = {
  Seg: 1,
  Ter: 2,
  Qua: 3,
  Qui: 4,
  Sex: 5,
  Sab: 6,
};

export function NextCard() {
  const [sessions, setSessions] = React.useState<ClassSession[] | null>(null);
  const [nextClass, setNextClass] = React.useState<ClassSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const supabase = createClientComponentClient();

  React.useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('classes')
          .select(
            'subject_name, professor, room, day, start_time, end_time, color',
          )
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao buscar aulas:', error);
          setSessions([]);
        } else {
          const mappedSessions = data.map(s => ({
            subjectName: s.subject_name,
            professor: s.professor,
            room: s.room,
            day: s.day,
            startTime: s.start_time,
            endTime: s.end_time,
            color: s.color,
          }));
          setSessions(mappedSessions);
        }
      } else {
        setSessions([]);
      }
      setLoading(false);
    }
    fetchSessions();
  }, [supabase]);

  React.useEffect(() => {
    if (!sessions) return;
    const now = new Date();

    const upcomingClasses = sessions
      .filter(s => dayMapping[s.day] === now.getDay())
      .map(s => {
        const [hour, minute] = s.startTime.split(':').map(Number);
        const classTime = set(now, {
          hours: hour,
          minutes: minute,
          seconds: 0,
          milliseconds: 0,
        });
        return { ...s, classTime };
      })
      .sort((a, b) => a.classTime.getTime() - b.classTime.getTime())
      .filter(s => !isBefore(s.classTime, now));

    setNextClass(upcomingClasses[0] || null);
  }, [sessions]);

  const calculateCountdown = () => {
    if (!nextClass) return null;
    const now = new Date();
    const [hour, minute] = nextClass.startTime.split(':').map(Number);
    const targetTime = set(now, { hours: hour, minutes: minute, seconds: 0 });
    const totalMinutes = differenceInMinutes(targetTime, now);
    if (totalMinutes < 0) return null;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  const countdown = calculateCountdown();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5" />
            Próxima Aula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/4 mt-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="w-5 h-5" />
          Próxima Aula
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nextClass ? (
          <div>
            <p className="text-2xl font-bold">{nextClass.subjectName}</p>
            <p className="text-muted-foreground">{nextClass.professor}</p>
            <p className="font-semibold mt-2">{nextClass.room}</p>
            <p className="text-sm text-muted-foreground">
              {nextClass.startTime} - {nextClass.endTime}
            </p>
            {countdown && (
              <Badge className="mt-2" variant="default">
                <Clock className="w-3 h-3 mr-1" />
                {countdown.hours > 0
                  ? `Faltam ${countdown.hours} h e ${countdown.minutes} min`
                  : `Faltam ${countdown.minutes} min`}
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Nenhuma próxima aula hoje.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

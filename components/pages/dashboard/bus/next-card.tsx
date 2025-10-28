'use client';

import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInMinutes, set } from 'date-fns';
import { BusFront, Clock } from 'lucide-react';

// --- Interfaces para os dados do ônibus ---
interface ScheduleData {
  voltas?: {
    horario_inicio: string;
    horario_fim: string;
    local_saida: string;
    [key: string]: any;
  }[];
  tipo?: string;
  ponto_partida?: string;
  horarios?: string[];
}
interface BusSchedule {
  valid_on: string;
  schedule: ScheduleData;
}
interface BusRoute {
  bus_schedules: BusSchedule[];
}
interface NextBusInfo {
  time: string;
  details: string;
  minutesUntil: number;
  endTime?: string;
  university?: string;
  busTime: Date;
}

// --- Funções Auxiliares ---

const calculateCountdown = (targetTime, now) => {
  const totalMinutes = differenceInMinutes(targetTime, now);
  if (totalMinutes < 0) return { hours: 0, minutes: 0 };
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
};

const findNextBus = (
  routes: BusRoute[],
  universityShortName: string,
): NextBusInfo | null => {
  const now = new Date();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

  let allDepartures: NextBusInfo[] = [];

  const dayOfWeek = now.getDay();
  let todayType = 'dias_uteis';
  if (dayOfWeek === 6) todayType = 'sabado';
  if (dayOfWeek === 0) todayType = 'domingo_feriado';

  routes.forEach(route => {
    route.bus_schedules
      .filter(schedule => schedule.valid_on === todayType)
      .forEach(schedule => {
        // Lógica para o formato UFRB
        if (schedule.schedule.voltas) {
          schedule.schedule.voltas
            // [CORREÇÃO APLICADA AQUI] O filtro foi removido.
            .forEach(volta => {
              const [hour, minute] = volta.horario_inicio
                .split(':')
                .map(Number);
              allDepartures.push({
                time: volta.horario_inicio,
                details: `Saída de: ${volta.local_saida}`,
                endTime: volta.horario_fim,
                university: 'UFRB',
                busTime: set(now, { hours: hour, minutes: minute, seconds: 0 }),
                minutesUntil: 0,
              });
            });
        }
        // Lógica para o formato UFBA
        if (
          schedule.schedule.tipo === 'partidas_fixas' &&
          schedule.schedule.horarios
        ) {
          schedule.schedule.horarios.forEach(horario => {
            const [hour, minute] = horario.split(':').map(Number);
            allDepartures.push({
              time: horario,
              details: `Partida de: ${schedule.schedule.ponto_partida}`,
              university: 'UFBA',
              busTime: set(now, { hours: hour, minutes: minute, seconds: 0 }),
              minutesUntil: 0,
            });
          });
        }
      });
  });

  allDepartures.sort((a, b) => a.busTime.getTime() - b.busTime.getTime());
  const nextDeparture = allDepartures.find(dep => dep.busTime > now);

  if (nextDeparture) {
    return {
      ...nextDeparture,
      minutesUntil: differenceInMinutes(nextDeparture.busTime, now),
    };
  }
  return null;
};

// --- Componente Principal ---
export default function NextCard() {
  const supabase = createClientComponentClient();
  const [nextBus, setNextBus] = React.useState<NextBusInfo | null>(null);
  const [countdown, setCountdown] = React.useState(null);
  const [hasBusService, setHasBusService] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const findAndSetNextBus = React.useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setHasBusService(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select(
          `
          campus_id,
          campuses (
            has_circular_bus,
            university_id,
            universities ( short_name )
          )
        `,
        )
        .eq('id', user.id)
        .single();

      const hasBus = profile?.campuses?.has_circular_bus || false;
      setHasBusService(hasBus);

      if (!hasBus) return;

      const { data: busData } = await supabase
        .from('bus_routes')
        .select('bus_schedules (valid_on, schedule)')
        .eq('university_id', profile.campuses.university_id)
        .eq('is_active', true);

      if (busData) {
        const universityName =
          profile.campuses.universities?.short_name || 'UNKNOWN';
        const next = findNextBus(busData, universityName);
        setNextBus(next);
        if (next) {
          setCountdown(calculateCountdown(next.busTime, new Date()));
        }
      }
    } catch (error) {
      console.error('[NextCard] ⛔️ ERRO:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    findAndSetNextBus();
    const intervalId = setInterval(findAndSetNextBus, 30000);
    return () => clearInterval(intervalId);
  }, [findAndSetNextBus]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BusFront className="w-5 h-5" />
            Próximo Ônibus
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-10 w-1/2 mb-2" />
          <Skeleton className="h-6 w-3/preenchimento5" />
        </CardContent>
      </Card>
    );
  }

  if (!hasBusService) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BusFront className="w-5 h-5" />
          Próximo Ônibus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nextBus && countdown ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{nextBus.details}</p>
            {nextBus.university === 'UFRB' && nextBus.endTime ? (
              <p className="my-1 text-4xl font-bold">
                {nextBus.time} - {nextBus.endTime}
              </p>
            ) : (
              <p className="my-1 text-4xl font-bold">{nextBus.time}</p>
            )}
            <Badge
              variant="default"
              className="flex items-center gap-2 w-fit mx-auto"
            >
              <Clock className="h-4 w-4" />
              {countdown.hours > 0
                ? `Faltam ${countdown.hours} h e ${countdown.minutes} min`
                : `Faltam ${countdown.minutes} min`}
            </Badge>
          </div>
        ) : (
          <p className="py-4 text-center text-muted-foreground">
            Não há mais ônibus hoje.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

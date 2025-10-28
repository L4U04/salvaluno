'use client';

import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';

// Interfaces para tipar os dados que vêm do Supabase
interface ScheduleData {
  voltas?: {
    volta: string;
    horario_inicio: string;
    horario_fim: string;
    local_saida: string;
    local_chegada: string;
  }[];
  tipo?: string;
  ponto_partida?: string;
  horarios?: string[];
  locais?: {
    nome: string;
    horarios: string[];
  }[];
}

interface BusSchedule {
  valid_on: string;
  schedule: ScheduleData;
  observation: string | null;
}

interface BusRoute {
  name: string;
  short_name: string;
  description: string | null;
  bus_schedules: BusSchedule[];
}

// Mapa para traduzir os tipos de dia
const dayTypeMap: { [key: string]: string } = {
  dias_uteis: 'Dias Úteis',
  sabado: 'Sábado',
  domingo_feriado: 'Domingo / Feriado',
};

export function Schedule() {
  const supabase = createClientComponentClient();
  const [routes, setRoutes] = React.useState<BusRoute[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchBusData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Utilizador não autenticado.');

        // [CORREÇÃO APLICADA AQUI] A consulta agora busca o university_id através do campus.
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(
            `
            campuses (
              university_id
            )
          `,
          )
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Se não houver campus ou university_id, não há nada a fazer.
        const universityId = profile?.campuses?.university_id;
        if (!universityId) {
          setRoutes([]);
          return;
        }

        const { data: busData, error: busError } = await supabase
          .from('bus_routes')
          .select(
            `
            name,
            short_name,
            description,
            bus_schedules (
              valid_on,
              schedule,
              observation
            )
          `,
          )
          .eq('university_id', universityId) // Usa o ID da universidade obtido
          .eq('is_active', true);

        if (busError) throw busError;

        setRoutes(busData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBusData();
  }, [supabase]);

  // UI para o estado de carregamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="ml-4">A carregar horários...</p>
      </div>
    );
  }

  // UI para o estado de erro
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // UI para quando não há horários
  if (routes.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Nenhum horário de ônibus encontrado para a sua universidade.
        </AlertDescription>
      </Alert>
    );
  }

  // Função auxiliar para renderizar o JSON de horários
  const renderScheduleData = (schedule: ScheduleData) => {
    // Caso 1: Formato UFRB (com "voltas")
    if (schedule.voltas && Array.isArray(schedule.voltas)) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Início
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Fim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Saída
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Chegada
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schedule.voltas.map((volta, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {volta.horario_inicio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {volta.horario_fim}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {volta.local_saida}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {volta.local_chegada}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Caso 2: Formato UFBA (com "partidas_fixas")
    if (schedule.tipo === 'partidas_fixas' && schedule.horarios) {
      return (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Ponto de partida: <strong>{schedule.ponto_partida}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {schedule.horarios.map((horario, index) => (
              <span
                key={index}
                className="bg-primary/10 text-primary text-sm font-medium px-2.5 py-0.5 rounded"
              >
                {horario}
              </span>
            ))}
          </div>
        </div>
      );
    }

    // Caso 3: Formato UFSB (com "partidas_por_local")
    if (schedule.tipo === 'partidas_por_local' && schedule.locais) {
      return (
        <div className="space-y-4">
          {schedule.locais.map(local => (
            <div key={local.nome}>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Partidas de: <strong>{local.nome}</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {local.horarios.map((horario, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary text-sm font-medium px-2.5 py-0.5 rounded"
                  >
                    {horario}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Fallback se o formato for desconhecido
    return (
      <p className="text-sm text-destructive">
        Formato de horário não reconhecido.
      </p>
    );
  };

  // UI Principal: Renderiza as rotas e os horários
  return (
    <div className="space-y-8">
      {routes.map(route => (
        <Card key={route.short_name}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{route.name}</CardTitle>
            {route.description && (
              <p className="text-muted-foreground pt-2">{route.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {route.bus_schedules.length > 0 ? (
              route.bus_schedules.map((schedule, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                    {dayTypeMap[schedule.valid_on] || schedule.valid_on}
                  </h3>
                  {renderScheduleData(schedule.schedule)}
                  {schedule.observation && (
                    <p className="text-xs text-muted-foreground mt-4">
                      <em>Obs: {schedule.observation}</em>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum horário específico encontrado para esta rota.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

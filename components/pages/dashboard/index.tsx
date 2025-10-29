'use client';

import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import Bus from '@/components/pages/dashboard/bus';
import Classroom from '@/components/pages/dashboard/class';
import Reminder from './reminder';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const supabase = createClientComponentClient();
  const [hasBusService, setHasBusService] = React.useState<boolean | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);

  // --- INÍCIO DA CORREÇÃO ---
  // O 'useEffect' abaixo foi substituído pela lógica de 2 etapas
  // que é mais robusta e não falha silenciosamente.
  React.useEffect(() => {
    const fetchBusCardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Se não houver usuário, definimos 'hasBus' como falso e paramos
        if (!user) {
          setHasBusService(false);
          return;
        }

        // PASSO 1: Buscar o 'campus_id' do perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('campus_id') // Apenas o campus_id
          .eq('id', user.id)
          .single();

        // Se falhar em encontrar o perfil ou o ID, definimos 'hasBus' como falso
        if (profileError || !profile?.campus_id) {
          console.error(
            'Dashboard: Não foi possível encontrar campus_id',
            profileError?.message,
          );
          setHasBusService(false);
          return; // Paramos aqui
        }

        // PASSO 2: Buscar os dados do campus usando o 'campus_id' encontrado
        const { data: campusData, error: campusError } = await supabase
          .from('campuses')
          .select('has_circular_bus, university_id')
          .eq('id', profile.campus_id)
          .single();

        // Se falhar em encontrar os dados do campus, definimos 'hasBus' como falso
        if (campusError || !campusData) {
          console.error(
            'Dashboard: Erro ao buscar dados do campus',
            campusError?.message,
          );
          setHasBusService(false);
          return; // Paramos aqui
        }

        // SUCESSO: Agora temos o valor real
        const hasBus = campusData.has_circular_bus || false;
        setHasBusService(hasBus);

        // A sua lógica original para buscar os horários
        if (hasBus && campusData.university_id) {
          const { data: busData } = await supabase
            .from('bus_routes')
            .select('bus_schedules (valid_on, schedule)')
            .eq('university_id', campusData.university_id)
            .eq('is_active', true);

          if (busData) {
            // setNextBus(findNextBus(busData));
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do ônibus para o card:', error);
        setHasBusService(false); // Garante que é falso em caso de erro
      } finally {
        setLoading(false);
      }
    };
    fetchBusCardData();
  }, [supabase]);
  // --- FIM DA CORREÇÃO ---

  // Enquanto verifica, podemos mostrar um skeleton para a grelha
  // [SEU DESIGN - INTOCADO]
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Painel Principal</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  // Classe da grelha dinâmica: 3 colunas se tiver ônibus, 2 se não tiver
  // [SEU DESIGN - INTOCADO]
  const gridColsClass = hasBusService ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  // [SEU DESIGN - INTOCADO]
  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Painel Principal</h1>

      {/* Usamos a classe dinâmica aqui */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-6`}>
        {/* O card do ônibus (e o seu div pai) só é renderizado se o serviço existir */}
        {hasBusService && (
          <div className="lg:col-span-1">
            <Bus.NextCard />
          </div>
        )}

        <div className="lg:col-span-1">
          <Classroom.NextCard />
        </div>
        <div className="lg:col-span-1">
          <Reminder.PriorityCard />
        </div>
      </div>
      <div className="mt-6"></div>
  t </div>
  );
}
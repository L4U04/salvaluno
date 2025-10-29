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

  // O 'useEffect' que já corrigimos (está CORRETO)
  React.useEffect(() => {
    const fetchBusCardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setHasBusService(false);
          return;
        }

        // PASSO 1: Buscar o 'campus_id' do perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('campus_id')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.campus_id) {
          console.error(
            'Dashboard: Não foi possível encontrar campus_id',
            profileError?.message,
          );
          setHasBusService(false);
          return;
        }

        // PASSO 2: Buscar os dados do campus usando o 'campus_id'
        const { data: campusData, error: campusError } = await supabase
          .from('campuses')
          .select('has_circular_bus, university_id')
          .eq('id', profile.campus_id)
          .single();

        if (campusError || !campusData) {
          console.error(
            'Dashboard: Erro ao buscar dados do campus',
            campusError?.message,
          );
          setHasBusService(false);
          return;
        }

        // SUCESSO: Define o estado 'hasBusService' com o valor correto
        const hasBus = campusData.has_circular_bus || false;
        setHasBusService(hasBus);

        if (hasBus && campusData.university_id) {
          // ... (sua lógica para buscar horários) ...
        }
      } catch (error) {
        console.error('Erro ao buscar dados do ônibus para o card:', error);
        setHasBusService(false);
      } finally {
        setLoading(false);
      }
    };
    fetchBusCardData();
  }, [supabase]);

  // O seu 'if (loading)' original (está correto)
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

  // A sua lógica de classe original (está correta)
  const gridColsClass = hasBusService ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Painel Principal</h1>

      {/* --- A CORREÇÃO ESTÁ AQUI ---
             Eu removi o 'md:grid-cols-2' que estava causando o conflito
             com a sua variável 'gridColsClass'.
      */}
      <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
        {/* O seu design original com 'div' wrappers */}
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
    </div>
  );
}
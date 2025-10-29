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
  React.useEffect(() => {
    const fetchBusCardData = async () => {
      try {
        const {

          data: { user },

        } = await supabase.auth.getUser();

        if (!user) return;



        // [CORREÇÃO APLICADA AQUI]

        const { data: profile } = await supabase

          .from('profiles')

          .select(

            `

            campus_id,

            campuses (

              has_circular_bus,

              university_id

            )

          `,

          )

          .eq('id', user.id)

          .single();



        const hasBus = profile?.campuses?.[0]?.has_circular_bus || false;

        setHasBusService(hasBus);



        if (!hasBus || !profile) return;



        // A consulta de horários agora usa o university_id vindo de campuses

        const { data: busData } = await supabase

          .from('bus_routes')

          .select('bus_schedules (valid_on, schedule)')

          .eq('university_id', profile.campuses?.[0]?.university_id)

          .eq('is_active', true);



        if (busData) {

          // setNextBus(findNextBus(busData)); // A função findNextBus ainda precisa ser definida ou importada

        }

      } catch (error) {

        console.error('Erro ao buscar dados do ônibus para o card:', error);

      } finally {

        setLoading(false);

      }

    };

    fetchBusCardData();

  }, [supabase]);

  // Enquanto verifica, podemos mostrar um skeleton para a grelha

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

  const gridColsClass = hasBusService ? 'lg:grid-cols-3' : 'lg:grid-cols-2';



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

    </div>

  );

}
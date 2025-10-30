'use client';

import Dashboard from '@/components/pages/dashboard';
import { Schedule as BusSchedule } from '@/components/pages/dashboard/bus/schedule';
import { Schedule as ClassSchedule } from '@/components/pages/dashboard/class/schedule';
import FeedbackPage from '@/components/pages/dashboard/feedback/schedule';
import UserProfile from '@/components/pages/dashboard/profile/schedule';
import Header from '@/components/pages/dashboard/ui/header';
import Sidebar from '@/components/pages/dashboard/ui/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { User } from '@supabase/supabase-js';

interface Profile {
  full_name?: string;
  avatar_url?: string;
  semestre_ingresso?: string;
  campus_id?: string;
}
type ConfigurationsContentProps = {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  loading: boolean;
  user: User | null;
};

function ConfigurationsContent({
  profile,
  setProfile,
  loading,
  user,
}: ConfigurationsContentProps) {
  return (
    <UserProfile
    profile={
      profile
      ? {
        full_name: profile.full_name ?? undefined,
        avatar_url: profile.avatar_url ?? undefined,
        semestre_ingresso: profile.semestre_ingresso ?? undefined,
      }
      : null
    }
    setProfile={setProfile}
    loading={loading}
    user={user}
    />
  );
}

const HeaderComponent = Header as unknown as React.ComponentType<{ title?: string }>;
export default function Page() {
  const [activeView, setActiveView] = React.useState('dashboard');
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, semestre_ingresso, campus_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil inicial:', error.message);
        }
        setProfile(
          profileData
            ? {
                full_name: profileData.full_name ?? undefined,
                avatar_url: profileData.avatar_url ?? undefined,
                semestre_ingresso: profileData.semestre_ingresso ?? undefined,
                campus_id: profileData.campus_id ?? undefined,
              }
            : null,
        );
      }
      setLoading(false);
    };
    fetchInitialData();
  }, [supabase]);

  React.useEffect(() => {
    const attemptProfileUpdate = async (
      userId: string,
      campusId: string,
      retries = 5,
    ) => {
      if (retries <= 0) {
        console.error(
          'Não foi possível encontrar o perfil para atualização após várias tentativas.',
        );
        Cookies.remove('selected_campus_id');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('campus_id')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        setTimeout(
          () => attemptProfileUpdate(userId, campusId, retries - 1),
          500,
        );
        return;
      } else if (profileError) {
        console.error(
          'Erro ao buscar perfil para atualização:',
          profileError.message,
        );
        Cookies.remove('selected_campus_id');
        return;
      }

      if (profileData && !profileData.campus_id) {
        // Atualiza o campo campus_id no Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ campus_id: campusId })
          .eq('id', userId);

        if (updateError) {
          console.error('ERRO AO ATUALIZAR O PERFIL:', updateError.message);
          Cookies.remove('selected_campus_id');
          return;
        }

        setProfile(prev =>
          prev ? { ...prev, campus_id: campusId } : {
            full_name: undefined,
            avatar_url: undefined,
            semestre_ingresso: undefined,
            campus_id: campusId,
          },
        );

        router.refresh();
      }

      Cookies.remove('selected_campus_id');
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const campusId = Cookies.get('selected_campus_id');
        if (campusId && session?.user) {
          attemptProfileUpdate(session.user.id, campusId);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <SidebarProvider
      style={{ '--sidebar-width': '280px' } as React.CSSProperties}
    >
      <Sidebar
        setActiveView={setActiveView}
        profile={profile}
        user={user}
        loading={loading}
      />
      <SidebarInset>

        <HeaderComponent
          title={activeView.charAt(0).toUpperCase() + activeView.slice(1)}
        />
        <main className="flex flex-1 flex-col items-center p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeView === 'class' && <ClassSchedule />}
              {activeView === 'bus' && <BusSchedule />}
              {activeView === 'dashboard' && <Dashboard />}
              {activeView === 'configurations' && (
                <ConfigurationsContent
                  profile={profile}
                  setProfile={setProfile}
                  loading={loading}
                  user={user}
                />
              )}
              {activeView === 'feedback' && <FeedbackPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

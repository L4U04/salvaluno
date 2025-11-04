'use client';

import * as React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Instagram,
  BusFront,
  Calendar,
  Cog,
  MailQuestionIcon,
  Inbox,
  GraduationCap,
} from 'lucide-react';
import { IntelligentAvatar } from '@/components/ui/intelligent-avatar';

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  setActiveView: (
    view: 'dashboard' | 'bus' | 'class' | 'configurations' | 'feedback',
  ) => void;
  profile: {
    full_name?: string;
    avatar_url?: string;
  } | null;
  user: { id: string; email?: string } | null;
  loading: boolean;
}

interface UniversityData {
  has_circular_bus: boolean;
  academic_system_url: string | null;
}

export default function DashboardSidebar({
  setActiveView,
  profile,
  user,
  loading,
  ...props
}: DashboardSidebarProps) {
const [universityData, setUniversityData] =
React.useState<UniversityData | null>(null);
const supabase = createClientComponentClient();
const [activeItem, setActiveItem] = React.useState('dashboard');


 React.useEffect(() => {
 const fetchUniversityData = async () => {

if (!user?.id || !profile) return;

 const campusId = (profile as any).campus_id; 
if (!campusId) {
console.error('Sidebar: Perfil não contém um campus_id.');
return;
}
const { data: campusData, error: campusError } = await supabase
.from('campuses')
.select(

'has_circular_bus, universities ( academic_system_url )'
 )
.eq('id', campusId)
.single();

if (campusError) {
console.error(
'Sidebar: Erro ao buscar dados específicos do campus:',
campusError.message,
 );
 return;
}

if (campusData) {

const academicUrl =
(campusData.universities as any)?.academic_system_url ||
(campusData.universities as any)?.[0]?.academic_system_url; 
setUniversityData({
 has_circular_bus: campusData.has_circular_bus,
academic_system_url: academicUrl || null,
 });
 }
 };

if (!loading) {
 fetchUniversityData();
 }
 }, [profile, user, loading, supabase]); 
interface UniversityData {
  has_circular_bus: boolean;
  academic_system_url: string | null;}

  const handleItemClick = (
    itemName: 'dashboard' | 'bus' | 'class' | 'configurations' | 'feedback',
  ) => {
    setActiveItem(itemName);
    setActiveView(itemName);
  };

  return (
    <Sidebar className="border-r hidden md:flex" {...props}>
      <SidebarContent className="p-2">
        <SidebarHeader className="mb-4 mt-2 px-2">
          <div className="flex items-center gap-3">
            <IntelligentAvatar
              fullName={loading ? null : profile?.full_name || 'Visitante'}
              avatarUrl={loading ? null : profile?.avatar_url ?? null}
            />
            <div className="flex flex-col truncate">
              <span className="font-semibold text-sm truncate">
                {loading ? 'Carregando...' : profile?.full_name || 'Visitante'}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {loading ? '...' : user?.email || 'Não Logado'}
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={`justify-start gap-2.5 px-2.5 ${activeItem === 'dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
              onClick={() => handleItemClick('dashboard')}
            >
              <Inbox className="size-5" />
              <span className="truncate">Página Principal</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={`justify-start gap-2.5 px-2.5 ${activeItem === 'class' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
              onClick={() => handleItemClick('class')}
            >
              <Calendar className="size-5" />
              <span className="truncate">Aulas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {universityData?.has_circular_bus && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`justify-start gap-2.5 px-2.5 ${activeItem === 'bus' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                onClick={() => handleItemClick('bus')}
              >
                <BusFront className="size-5" />
                <span className="truncate">Ônibus</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {universityData?.academic_system_url && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="justify-start gap-2.5 px-2.5"
                asChild
              >
                <a
                  href={universityData.academic_system_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GraduationCap className="size-5" />
                  <span className="truncate">Portal Acadêmico</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              className={`justify-start gap-2.5 px-2.5 ${activeItem === 'configurations' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
              onClick={() => handleItemClick('configurations')}
            >
              <Cog className="size-5" />
              <span className="truncate">Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={`justify-start gap-2.5 px-2.5 ${activeItem === 'feedback' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
              onClick={() => handleItemClick('feedback')}
            >
              <MailQuestionIcon className="size-5" />
              <span className="truncate">Em Breve: Salvaluno Premium</span>
            
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="justify-start gap-2.5 px-2.5">
              <Instagram className="size-5" />
              <a href="https://www.instagram.com/salvaluno">@salvaluno
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

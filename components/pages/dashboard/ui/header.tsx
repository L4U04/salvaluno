import Bar from '@/components/pages/dashboard/reminder/bar';
import { ThemeToggle } from '@/components/theme-toggle';
import Clock from '@/components/ui/digital-clock';
import { SidebarTrigger } from '@/components/ui/sidebar';
export default function Header() {
  return (
    <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <h1 className="text-lg font-semibold">Salvaluno</h1>
      </div>
      <div className="items-center">
        <Clock />
      </div>
      <div className="flex items-center gap-4">
        <Bar />
        <ThemeToggle />
      </div>
    </header>
  );
}

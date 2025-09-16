'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookCopy,
  CalendarDays,
  FileQuestion,
  LayoutDashboard,
  Bot,
  LogOut,
  NotebookText,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/hooks/use-app';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/syllabus', icon: BookCopy, label: 'Syllabus' },
  { href: '/study-plan', icon: CalendarDays, label: 'Study Plan' },
  { href: '/quiz', icon: FileQuestion, label: 'Quiz' },
  { href: '/flashcards', icon: NotebookText, label: 'Flashcards' },
  { href: '/tutor', icon: Bot, label: 'Tutor' },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { mindMap, isSyllabusLoading, clearSyllabusData } = useAppContext();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isSyllabusLoading && !mindMap) {
      router.replace('/');
    }
  }, [mindMap, isSyllabusLoading, router, isClient]);

  const handleLogout = () => {
    clearSyllabusData();
    router.push('/');
  };

  if (!isClient || isSyllabusLoading || !mindMap) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/dashboard">
                <Icons.logo className="size-6 text-primary" />
              </Link>
            </Button>
            <h2 className="font-headline text-lg font-semibold truncate">ExamPrep AI</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span>New Syllabus</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </SidebarProvider>
  );
}

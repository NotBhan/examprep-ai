
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
  Upload,
  History,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { useAppContext } from '@/hooks/use-app';
import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Loader } from '@/components/loader';


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
  const { user, activeSyllabus, isSyllabusLoading } = useAppContext();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isSyllabusLoading && !user) {
      router.replace('/');
    }
  }, [user, isSyllabusLoading, router, isClient]);
  
  useEffect(() => {
    if (isClient && user && !isSyllabusLoading && !activeSyllabus && pathname !== '/upload' && pathname !== '/' && pathname !== '/history') {
      router.replace('/upload');
    }
  }, [user, activeSyllabus, isSyllabusLoading, router, isClient, pathname]);


  if (!isClient || !user) {
    return <Loader />;
  }

  if (isSyllabusLoading) {
    return <Loader />
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b h-16 flex items-center p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
                <Icons.logo className="size-8 text-primary" />
                <h2 className="font-headline text-xl font-semibold truncate">ExamPrep AI</h2>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {activeSyllabus && navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    size="lg"
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             <SidebarMenuItem>
                <Link href="/upload">
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/upload')}
                    tooltip="Upload Syllabus"
                    size="lg"
                  >
                    <Upload />
                    <span>New Syllabus</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/history">
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/history')}
                    tooltip="Syllabus History"
                    size="lg"
                  >
                    <History />
                    <span>Syllabus History</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

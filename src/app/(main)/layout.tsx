
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Header } from '@/components/header';


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
  const { user, mindMap, isSyllabusLoading, logout } = useAppContext();
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
    if (isClient && user && !isSyllabusLoading && !mindMap && pathname !== '/upload' && pathname !== '/') {
      router.replace('/upload');
    }
  }, [user, mindMap, isSyllabusLoading, router, isClient, pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isClient || isSyllabusLoading || !user) {
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
        <SidebarHeader className="p-2">
          <div className="flex h-10 items-center gap-2">
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
            {mindMap && navItems.map((item) => (
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
             <SidebarMenuItem>
                <Link href="/upload">
                  <SidebarMenuButton
                    isActive={pathname.startsWith('/upload')}
                    tooltip="Upload Syllabus"
                  >
                    <Upload />
                    <span>{ mindMap ? "New Syllabus" : "Upload Syllabus" }</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
                <Avatar className="h-9 w-9">
                    <AvatarFallback>{user?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate">{user}</span>
                </div>
            </div>
        </SidebarFooter>
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

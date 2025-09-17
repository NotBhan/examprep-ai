
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';

const breadcrumbNameMap: { [key: string]: string } = {
  '/dashboard': 'Dashboard',
  '/syllabus': 'Syllabus',
  '/study-plan': 'Study Plan',
  '/quiz': 'Quiz',
  '/flashcards': 'Flashcards',
  '/tutor': 'Marika (Tutor)',
  '/upload': 'Upload',
  '/history': 'Syllabus History',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((i) => i);

  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        <li>
          <Link href="/dashboard" className="font-semibold text-foreground">
            Home
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          const name = breadcrumbNameMap[href] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <Fragment key={href}>
              <li className="text-muted-foreground">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li>
                {isLast ? (
                  <span className="font-semibold text-foreground">{name}</span>
                ) : (
                  <Link href={href} className="hover:text-foreground">
                    {name}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

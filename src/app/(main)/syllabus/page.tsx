
'use client';

import { useAppContext } from '@/hooks/use-app';
import type { SyllabusSubTopic, SyllabusTopic } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SyllabusPage() {
  const { mindMap } = useAppContext();

  const renderTopicNode = (topic: SyllabusTopic | SyllabusSubTopic, isTopLevel = false) => {
    const topicName = typeof topic === 'string' ? topic : topic.topic;
    if (!topicName) return null;
    
    const hasSubtopics = typeof topic === 'object' && topic.subtopics && topic.subtopics.length > 0;

    const accordionItem = (
        <Accordion type="single" collapsible className="w-full" disabled={!hasSubtopics}>
            <AccordionItem value={topicName} className="border-b-0">
                <AccordionTrigger
                    className="hover:no-underline rounded-md hover:bg-accent/50 px-2 text-left py-3 data-[state=open]:font-bold"
                    chevron={hasSubtopics}
                >
                   <div className="flex items-center justify-between gap-4 w-full">
                        <p className={`font-semibold ${hasSubtopics ? 'text-lg' : ''}`}>{topicName}</p>
                        {typeof topic === 'object' && topic.weightage !== undefined && (
                            <Badge variant="secondary" className="mr-2">Weightage: {topic.weightage}</Badge>
                        )}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-2 pr-2 pl-4">
                    {hasSubtopics && (
                       <ul>
                            {topic.subtopics.map((sub) => renderTopicNode(sub))}
                       </ul>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );

    if (isTopLevel) {
        return (
            <Card key={topicName} className="mb-4">
                <CardContent className="p-2">
                    {accordionItem}
                </CardContent>
            </Card>
        )
    }

    return (
        <li className={`ml-4 border-l border-solid ${hasSubtopics ? '' : 'list-none'}`} key={topicName}>
            {accordionItem}
        </li>
    );
  }

  if (!mindMap?.topics) {
    return (
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">Syllabus</h2>
        <Card>
            <CardHeader>
                <CardTitle>No Syllabus Found</CardTitle>
                <CardDescription>Upload your syllabus to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/upload">Upload Syllabus</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
        <div className="mb-4">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Syllabus Tree View</h2>
            <p className="text-muted-foreground">Here is a breakdown of your syllabus topics and sub-topics.</p>
        </div>
       <div>
            {mindMap.topics
                .filter(topic => topic && typeof topic === 'object' && topic.topic)
                .map((topic) => renderTopicNode(topic, true))
            }
        </div>
    </div>
  );
}

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

const TopicNode = ({ topic }: { topic: SyllabusTopic | SyllabusSubTopic }) => {
  if (typeof topic === 'string') {
    return <li className="py-2 pl-4 border-l border-dashed border-border ml-4">{topic}</li>;
  }

  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

  return (
    <AccordionItem value={topic.topic} className="border-b-0">
      <AccordionTrigger className="hover:no-underline rounded-md hover:bg-accent/50 px-2 text-left">
        <div className="flex items-center gap-4 w-full">
            <span className="font-semibold flex-1">{topic.topic}</span>
            {topic.weightage && <Badge variant="secondary">Weightage: {topic.weightage}</Badge>}
        </div>
      </AccordionTrigger>
      {hasSubtopics && (
        <AccordionContent className="pl-6 border-l border-dashed ml-4">
          <Accordion type="multiple" className="w-full flex flex-col gap-1">
            <ul>
                {topic.subtopics
                  .filter(sub => sub && (typeof sub === 'string' || sub.topic))
                  .map((sub, index) => (
                    <TopicNode key={typeof sub === 'string' ? sub : sub.topic + index} topic={sub} />
                ))}
            </ul>
          </Accordion>
        </AccordionContent>
      )}
    </AccordionItem>
  );
};

export default function SyllabusPage() {
  const { mindMap } = useAppContext();

  if (!mindMap?.topics) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">Syllabus</h2>
        <Card>
            <CardHeader>
                <CardTitle>No Syllabus Found</CardTitle>
                <CardDescription>Upload your syllabus to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Upload Syllabus</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">Syllabus Tree View</h2>
      <Card>
        <CardContent className="p-4 md:p-6">
            <Accordion type="multiple" className="w-full flex flex-col gap-2">
                {mindMap.topics
                  .filter((topic): topic is SyllabusTopic => !!topic?.topic)
                  .map((topic, index) => (
                    <TopicNode key={topic.topic + index} topic={topic} />
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

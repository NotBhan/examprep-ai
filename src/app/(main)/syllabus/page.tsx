
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
import { useState } from 'react';
import { askTutorAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info } from 'lucide-react';

type Answer = {
    text: string;
    fromSyllabus: boolean;
}

export default function SyllabusPage() {
  const { mindMap, syllabusText } = useAppContext();
  const { toast } = useToast();
  
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null);

  const handleToggle = async (topic: string) => {
    // If answer already exists or is loading, do nothing
    if (answers[topic] || loadingTopic === topic) {
      return;
    }

    if (!syllabusText) {
        toast({ variant: 'destructive', title: 'Error', description: 'Syllabus content is not available.' });
        return;
    }

    setLoadingTopic(topic);
    try {
        const result = await askTutorAction({
            syllabusContent: syllabusText,
            question: `Explain the concept of "${topic}" within the context of my syllabus.`,
        });

        if (result.success && result.data?.answer) {
            setAnswers(prev => ({ ...prev, [topic]: { text: result.data.answer, fromSyllabus: result.data.fromSyllabus } }));
        } else {
            throw new Error(result.error || 'Failed to get an answer.');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Tutor Error', description: error.message });
        setAnswers(prev => ({ ...prev, [topic]: { text: "Sorry, I couldn't fetch an explanation for this topic.", fromSyllabus: false } }));
    } finally {
        setLoadingTopic(null);
    }
  };

  const renderTopicNode = (topic: SyllabusTopic | SyllabusSubTopic) => {
    const topicName = typeof topic === 'string' ? topic : topic.topic;
    if (!topicName) return null;
    
    const hasSubtopics = typeof topic === 'object' && topic.subtopics && topic.subtopics.length > 0;

    return (
        <li className={`ml-4 border-l border-solid ${hasSubtopics ? '' : 'list-none'} mb-2`} key={topicName}>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={topicName} className="border-b-0">
                    <AccordionTrigger
                        className="hover:no-underline rounded-md hover:bg-accent/50 px-2 text-left py-3 data-[state=open]:font-bold"
                        onClick={() => handleToggle(topicName)}
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
                         {loadingTopic === topicName ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin"/> Generating...
                            </div>
                        ) : (
                            answers[topicName] && (
                                <div>
                                    <p className="text-muted-foreground italic text-sm">{answers[topicName].text}</p>
                                    {!answers[topicName].fromSyllabus && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-2 rounded-md">
                                            <Info className="h-4 w-4 shrink-0" />
                                            <span>Answer based on general knowledge.</span>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                        {hasSubtopics && (
                           <ul>
                                {topic.subtopics.map((sub, index) => renderTopicNode(sub))}
                           </ul>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
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
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">Syllabus Tree View</h2>
       <Card>
            <CardHeader>
                <CardTitle>Interactive Syllabus</CardTitle>
                <CardDescription>Click on any topic to expand it and get an instant AI-powered explanation.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                 <ul>
                    {mindMap.topics
                        .filter(topic => topic && typeof topic === 'object' && topic.topic)
                        .map((topic, index) => renderTopicNode(topic))
                    }
                </ul>
            </CardContent>
       </Card>
    </div>
  );
}

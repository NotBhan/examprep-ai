
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
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const TopicNode = ({ topic, onAsk }: { topic: SyllabusTopic | SyllabusSubTopic; onAsk: (question: string) => void }) => {
  if (typeof topic === 'string') {
    return (
        <li className="py-2 pl-4 border-l border-dashed border-border ml-4">
            <button onClick={() => onAsk(topic)} className="text-left hover:underline">{topic}</button>
        </li>
    );
  }
  
  if (!topic || typeof topic !== 'object' || !topic.topic) {
    return null;
  }

  const hasSubtopics = topic.subtopics && Array.isArray(topic.subtopics) && topic.subtopics.length > 0;

  return (
    <AccordionItem value={topic.topic} className="border-b-0">
        <AccordionTrigger 
            className="hover:no-underline rounded-md hover:bg-accent/50 px-2 text-left"
            onClick={() => onAsk(topic.topic)}
        >
            <div className="flex items-center gap-4 w-full">
                <div className="flex-1 text-left">
                  <p className="font-semibold text-lg">{topic.topic}</p>
                </div>
                {topic.weightage !== undefined && <Badge variant="secondary" className="mt-1">Weightage: {topic.weightage}</Badge>}
            </div>
        </AccordionTrigger>
        <AccordionContent className="pl-6 border-l border-dashed ml-4">
            {hasSubtopics && (
                <Accordion type="multiple" className="w-full flex flex-col gap-1">
                <ul>
                    {topic.subtopics
                      .filter(sub => sub && (typeof sub === 'string' || (typeof sub === 'object' && sub.topic)))
                      .map((sub, index) => (
                        <TopicNode key={(typeof sub === 'string' ? sub : sub?.topic) + index} topic={sub} onAsk={onAsk} />
                      ))}
                </ul>
                </Accordion>
            )}
        </AccordionContent>
    </AccordionItem>
  );
};

export default function SyllabusPage() {
  const { mindMap, syllabusText } = useAppContext();
  const { toast } = useToast();
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
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
            setAnswers(prev => ({ ...prev, [topic]: result.data.answer }));
        } else {
            throw new Error(result.error || 'Failed to get an answer.');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Tutor Error', description: error.message });
        setAnswers(prev => ({ ...prev, [topic]: "Sorry, I couldn't fetch an explanation for this topic." }));
    } finally {
        setLoadingTopic(null);
    }
  };

  const renderTopicNode = (topic: SyllabusTopic | SyllabusSubTopic) => {
    if (typeof topic === 'string') {
        const topicName = topic;
        return (
            <li className="ml-4 border-l border-dashed" key={topicName}>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={topicName} className="border-b-0">
                        <AccordionTrigger
                            className="hover:no-underline rounded-md hover:bg-accent/50 px-2 text-left py-3"
                            onClick={() => handleToggle(topicName)}
                        >
                           <p className="font-semibold">{topicName}</p>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-2 pr-2">
                             {loadingTopic === topicName ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin"/> Generating...
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic text-sm">{answers[topicName]}</p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </li>
        );
    }

    if (!topic || !topic.topic) return null;
    const topicName = topic.topic;
    const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

    return (
        <AccordionItem value={topicName} key={topicName} className="border rounded-lg mb-2 bg-card">
            <AccordionTrigger 
                className="hover:no-underline px-4 text-left"
                onClick={() => handleToggle(topicName)}
            >
                <div className="flex items-center justify-between gap-4 w-full">
                    <p className="font-semibold text-lg">{topicName}</p>
                    {topic.weightage !== undefined && <Badge variant="secondary">Weightage: {topic.weightage}</Badge>}
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2">
                {loadingTopic === topicName ? (
                    <div className="flex items-center gap-2 text-muted-foreground p-4">
                        <Loader2 className="h-5 w-5 animate-spin"/> Thinking...
                    </div>
                ) : (
                    <p className="text-muted-foreground italic mb-4">{answers[topicName]}</p>
                )}
                
                {hasSubtopics && (
                    <ul>
                        {topic.subtopics.map((sub, index) => renderTopicNode(sub))}
                    </ul>
                )}
            </AccordionContent>
        </AccordionItem>
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
                <Accordion type="multiple" className="w-full flex flex-col gap-2">
                    {mindMap.topics
                        .filter(topic => topic && typeof topic === 'object' && topic.topic)
                        .map((topic) => renderTopicNode(topic))
                    }
                </Accordion>
            </CardContent>
       </Card>
    </div>
  );
}

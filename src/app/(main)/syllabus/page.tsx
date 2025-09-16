
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

  if (hasSubtopics) {
    return (
        <AccordionItem value={topic.topic} className="border-b-0">
        <AccordionTrigger className="hover:no-underline rounded-md hover:bg-accent/50 px-2 text-left">
            <div className="flex items-start gap-4 w-full">
                <div className="flex-1 text-left">
                  <p className="font-semibold">{topic.topic}</p>
                  {topic.definition && (
                    <p className="text-xs text-muted-foreground mt-1">{topic.definition}</p>
                  )}
                </div>
                {topic.weightage !== undefined && <Badge variant="secondary" className="mt-1">Weightage: {topic.weightage}</Badge>}
            </div>
        </AccordionTrigger>
        <AccordionContent className="pl-6 border-l border-dashed ml-4">
            <Accordion type="multiple" className="w-full flex flex-col gap-1">
            <ul>
                {topic.subtopics
                  .filter(sub => sub && (typeof sub === 'string' || (typeof sub === 'object' && sub.topic)))
                  .map((sub, index) => (
                    <TopicNode key={(typeof sub === 'string' ? sub : sub?.topic) + index} topic={sub} onAsk={onAsk} />
                ))}
            </ul>
            </Accordion>
        </AccordionContent>
        </AccordionItem>
    );
  }

  return (
    <div className="flex items-center px-2 py-4">
        <div className="flex-1 text-left">
            <button onClick={() => onAsk(topic.topic)} className="font-semibold text-left hover:underline">{topic.topic}</button>
            {topic.definition && (
                <p className="text-xs text-muted-foreground mt-1">{topic.definition}</p>
            )}
        </div>
        {topic.weightage !== undefined && <Badge variant="secondary">Weightage: {topic.weightage}</Badge>}
    </div>
  );
};

export default function SyllabusPage() {
  const { mindMap, syllabusText } = useAppContext();
  const { toast } = useToast();
  
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorAnswer, setTutorAnswer] = useState('');
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

  const handleAskQuestion = async (question: string) => {
    if (!syllabusText) {
        toast({ variant: 'destructive', title: 'Error', description: 'Syllabus content is not available.' });
        return;
    }
    
    setTutorQuestion(`Explain the concept of "${question}" from the syllabus.`);
    setTutorAnswer('');
    setIsLoadingAnswer(true);
    setIsTutorOpen(true);

    try {
        const result = await askTutorAction({
            syllabusContent: syllabusText,
            question: `Explain the concept of "${question}" within the context of my syllabus.`,
        });

        if (result.success && result.data?.answer) {
            setTutorAnswer(result.data.answer);
        } else {
            throw new Error(result.error || 'Failed to get an answer.');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Tutor Error', description: error.message });
        setIsTutorOpen(false);
    } finally {
        setIsLoadingAnswer(false);
    }
  };


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
                <CardDescription>Click on any topic or sub-topic to get an instant AI-powered explanation.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <Accordion type="multiple" className="w-full flex flex-col gap-2">
                    {mindMap.topics
                    .filter(topic => topic && typeof topic === 'object' && topic.topic)
                    .map((topic, index) => (
                        <TopicNode key={topic.topic + index} topic={topic} onAsk={handleAskQuestion}/>
                    ))}
                </Accordion>
            </CardContent>
       </Card>

        <Dialog open={isTutorOpen} onOpenChange={setIsTutorOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>AI Tutor</DialogTitle>
                    <DialogDescription>{tutorQuestion}</DialogDescription>
                </DialogHeader>
                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                    {isLoadingAnswer ? (
                         <div className="flex flex-col items-center justify-center text-center p-8">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
                            <p className="text-lg font-semibold">Generating your explanation...</p>
                            <p className="text-muted-foreground">This may take a moment.</p>
                         </div>
                    ) : (
                        <Textarea
                            readOnly
                            value={tutorAnswer}
                            className="w-full min-h-[200px] bg-muted/50 text-base"
                            rows={15}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}

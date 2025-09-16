
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Loader2, RotateCw, Lightbulb } from 'lucide-react';
import { useAppContext } from '@/hooks/use-app';
import { generateFlashcardsAction } from '../actions';
import { useToast } from '@/hooks/use-toast';
import type { SyllabusSubTopic, SyllabusTopic } from '@/lib/types';

type Flashcard = {
  question: string;
  answer: string;
};

export default function FlashcardsPage() {
  const { mindMap, syllabusText } = useAppContext();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const topics = useMemo(() => {
    const allTopics: { value: string; label: string }[] = [];
    const extractTopics = (topics: (SyllabusTopic | SyllabusSubTopic)[], prefix = '') => {
      topics.forEach((topic) => {
        if (typeof topic === 'string') {
          allTopics.push({ value: `${prefix}${topic}`, label: `${prefix}${topic}` });
        } else if (topic && topic.topic) {
          const newPrefix = prefix ? `${prefix} > ${topic.topic}` : topic.topic;
          allTopics.push({ value: newPrefix, label: newPrefix });
          if (topic.subtopics) {
            extractTopics(topic.subtopics, newPrefix);
          }
        }
      });
    };
    if (mindMap?.topics) {
      extractTopics(mindMap.topics);
    }
    return allTopics;
  }, [mindMap]);

  const handleGenerate = async () => {
    if (!selectedTopic || !syllabusText) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a topic first.',
      });
      return;
    }
    setIsLoading(true);
    setFlashcards([]);
    try {
      const result = await generateFlashcardsAction({ topic: selectedTopic, syllabusContent: syllabusText });
      if (result.success && result.data) {
        setFlashcards(result.data.flashcards);
      } else {
        throw new Error(result.error || 'Failed to generate flashcards.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        AI Flashcard Generator
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Select a Topic</CardTitle>
          <CardDescription>Choose a topic from your syllabus to generate flashcards.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Select onValueChange={setSelectedTopic} value={selectedTopic}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select a topic..." />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic, index) => (
                <SelectItem key={`${topic.value}-${index}`} value={topic.value}>
                  {topic.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={isLoading || !selectedTopic} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Flashcards'
            )}
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
         <div className="flex flex-col items-center justify-center text-center mt-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
            <p className="text-lg font-semibold">Generating your flashcards...</p>
            <p className="text-muted-foreground">This may take a moment.</p>
         </div>
      )}

      {!isLoading && flashcards.length === 0 && (
        <Card className="mt-8 text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    Ready to Learn?
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Select a topic and click "Generate Flashcards" to begin your study session.</p>
            </CardContent>
        </Card>
      )}

      {flashcards.length > 0 && (
        <div className="mt-8">
            <Carousel className="w-full max-w-xl mx-auto">
                <CarouselContent>
                    {flashcards.map((card, index) => (
                        <CarouselItem key={index}>
                            <FlashcardItem card={card} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
      )}
    </div>
  );
}

function FlashcardItem({ card }: { card: Flashcard }) {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const styleId = 'backface-visibility-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
              .backface-hidden {
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
              }
              .preserve-3d {
                transform-style: preserve-3d;
              }
              .rotate-y-180 {
                transform: rotateY(180deg);
              }
            `;
            document.head.appendChild(style);
        }
    }, [])
  
    return (
      <div className="p-1" style={{ perspective: '1000px' }}>
        <div 
          className="relative w-full h-80 rounded-lg shadow-lg transition-transform duration-700 preserve-3d"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : '' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of the card */}
          <div className="absolute w-full h-full backface-hidden bg-card border rounded-lg flex flex-col justify-center items-center p-6 text-center">
            <p className="text-muted-foreground text-sm mb-2">Question</p>
            <p className="text-xl md:text-2xl font-semibold">{card.question}</p>
          </div>
  
          {/* Back of the card */}
          <div className="absolute w-full h-full backface-hidden bg-card border rounded-lg flex flex-col justify-center items-center p-6 text-center rotate-y-180">
             <p className="text-muted-foreground text-sm mb-2">Answer</p>
            <p className="text-lg md:text-xl">{card.answer}</p>
          </div>
        </div>
         <div className="text-center mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsFlipped(!isFlipped)}>
                <RotateCw className="mr-2 h-4 w-4"/>
                Flip Card
            </Button>
        </div>
      </div>
    );
}

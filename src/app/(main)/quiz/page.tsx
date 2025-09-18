
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useAppContext } from '@/hooks/use-app';
import { generateQuizAction } from '../actions';
import type { SyllabusSubTopic, SyllabusTopic, GenerateQuizOutput } from '@/lib/types';
import { CheckCircle, XCircle, Loader2, Lightbulb, FileQuestion, ArrowLeft, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type QuizData = GenerateQuizOutput['quiz'];

const quizFormSchema = z.object({
  topic: z.string().min(1, 'Please select a topic.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  numQuestions: z.number().min(1).max(15),
});

export default function QuizPage() {
  const { mindMap, syllabusText, showErrorDialog } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizState, setQuizState] = useState<'configuring' | 'taking' | 'results'>('configuring');

  const topics = useMemo(() => {
    const allTopics: { value: string; label: string }[] = [{ value: 'Complete Syllabus', label: 'Complete Syllabus' }];
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

  const form = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      topic: '',
      difficulty: 'medium',
      numQuestions: 5,
    },
  });

  const handleGenerateQuiz = async (values: z.infer<typeof quizFormSchema>) => {
    if (!syllabusText) {
        showErrorDialog('Error', 'No syllabus content found.');
        return;
    }
    setIsLoading(true);
    setQuizData(null);
    try {
      const result = await generateQuizAction({ ...values, syllabusContent: syllabusText });
      if (result.success && result.data) {
        setQuizData(result.data.quiz);
        setUserAnswers(new Array(result.data.quiz.length).fill(''));
        setCurrentQuestionIndex(0);
        setQuizState('taking');
      } else {
        throw new Error(result.error || 'Failed to generate quiz.');
      }
    } catch (error: any) {
      showErrorDialog(
        'Quiz Generation Failed',
        error.message
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };
  
  const handleNextQuestion = () => {
      if (quizData && currentQuestionIndex < quizData.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
          setQuizState('results');
      }
  }

  const score = useMemo(() => {
    if (!quizData) return 0;
    return userAnswers.reduce((correctCount, answer, index) => {
        return answer === quizData[index].correctAnswer ? correctCount + 1 : correctCount;
    }, 0);
  }, [userAnswers, quizData]);

  const resetQuiz = () => {
    setQuizData(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizState('configuring');
    form.reset();
  }

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center text-center mt-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
            <p className="text-lg font-semibold">Generating your quiz...</p>
            <p className="text-muted-foreground">The AI is preparing your questions. This may take a moment.</p>
        </div>
    )
  }

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold tracking-tight font-headline">
                On-Demand Quiz Engine
            </h2>
            {quizState !== 'configuring' && (
                 <Button variant="outline" onClick={resetQuiz}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Config
                 </Button>
            )}
        </div>

        {quizState === 'configuring' && (
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Create a New Quiz</CardTitle>
                    <CardDescription>Select a topic and customize your quiz settings.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleGenerateQuiz)}>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="topic"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Topic</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a topic from your syllabus..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {topics.map((topic, index) => (
                                                    <SelectItem key={`${topic.value}-${index}`} value={topic.value}>
                                                        {topic.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="difficulty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Difficulty</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a difficulty" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="easy">Easy</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="numQuestions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of Questions: {field.value}</FormLabel>
                                         <FormControl>
                                            <Slider
                                                min={1}
                                                max={15}
                                                step={1}
                                                value={[field.value]}
                                                onValueChange={(vals) => field.onChange(vals[0])}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                                ) : 'Start Quiz'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
             </Card>
        )}

        {quizState === 'taking' && quizData && (
             <div className="max-w-2xl mx-auto">
                <Progress value={((currentQuestionIndex + 1) / quizData.length) * 100} className="mb-4" />
                <Card>
                    <CardHeader>
                        <CardTitle>Question {currentQuestionIndex + 1} of {quizData.length}</CardTitle>
                        <CardDescription className="text-lg pt-2">{quizData[currentQuestionIndex].question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <RadioGroup onValueChange={handleAnswerSelect} value={userAnswers[currentQuestionIndex]} className="space-y-4">
                            {quizData[currentQuestionIndex].options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-3 space-y-0">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="font-normal text-base w-full cursor-pointer p-3 border rounded-md hover:bg-accent/50 has-[[data-state=checked]]:bg-accent">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                         </RadioGroup>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleNextQuestion} disabled={!userAnswers[currentQuestionIndex]} className="w-full">
                            {quizData && currentQuestionIndex < quizData.length - 1 ? 'Next Question' : 'Finish Quiz'}
                         </Button>
                    </CardFooter>
                </Card>
            </div>
        )}

        {quizState === 'results' && quizData && (
             <div className="max-w-3xl mx-auto">
                <Card className="mb-8 text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Quiz Results</CardTitle>
                        <CardDescription>You scored</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-6xl font-bold text-primary">{score} / {quizData.length}</p>
                        <p className="text-2xl text-muted-foreground mt-2">({((score / quizData.length) * 100).toFixed(0)}%)</p>
                    </CardContent>
                     <CardFooter className="flex-col gap-4">
                        <Button onClick={resetQuiz} className="w-full sm:w-auto">
                           <RotateCw className="mr-2 h-4 w-4"/>
                           Take Another Quiz
                        </Button>
                    </CardFooter>
                </Card>
                
                <h3 className="text-2xl font-bold mb-4 font-headline text-center">Review Your Answers</h3>
                <Accordion type="single" collapsible className="w-full">
                    {quizData.map((q, index) => {
                        const userAnswer = userAnswers[index];
                        const isCorrect = userAnswer === q.correctAnswer;
                        return (
                             <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className={cn("p-4 rounded-md hover:bg-accent/50", isCorrect ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-red-500/10 hover:bg-red-500/20')}>
                                    <div className="flex items-center gap-4">
                                        {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-red-500"/>}
                                        <p className="font-semibold text-left">Question {index+1}: {q.question}</p>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border-t-0 border rounded-b-md">
                                    <div className="space-y-4">
                                        <p><strong>Your answer:</strong> <span className={cn(isCorrect ? "text-green-600" : "text-red-600")}>{userAnswer || "No answer"}</span></p>
                                        {!isCorrect && <p><strong>Correct answer:</strong> {q.correctAnswer}</p>}
                                        <div>
                                            <p className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary"/> Explanation</p>
                                            <p className="text-muted-foreground mt-1">{q.explanation}</p>
                                        </div>
                                    </div>
                                </AccordionContent>
                             </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
  FormDescription,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Loader2, BookOpen } from 'lucide-react';
import { useAppContext } from '@/hooks/use-app';
import { generateStudyPlanAction } from '../actions';
import ReactMarkdown from 'react-markdown';

const formSchema = z.object({
  examDate: z.date({
    required_error: 'An exam date is required.',
  }),
  studyHours: z.number().min(1).max(16),
  studyStyle: z.string({
    required_error: 'Please select a study style.',
  }),
  intensity: z.string({
    required_error: 'Please select an intensity level.',
  }),
});

export default function StudyPlanPage() {
  const { syllabusText, showErrorDialog } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      studyHours: 2,
      studyStyle: 'balanced',
      intensity: 'medium',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!syllabusText) {
      showErrorDialog(
        'Error',
        'No active syllabus found. Please upload a syllabus first.'
      );
      return;
    }
    setIsLoading(true);
    setStudyPlan(null);
    try {
      const result = await generateStudyPlanAction({
        examDate: format(data.examDate, 'yyyy-MM-dd'),
        studyHours: data.studyHours,
        studyStyle: data.studyStyle,
        intensity: data.intensity,
        syllabus: syllabusText,
      });

      if (result.success && result.data) {
        setStudyPlan(result.data.studySchedule);
      } else {
        throw new Error(result.error || 'Failed to generate study plan.');
      }
    } catch (error: any) {
      showErrorDialog(
        'Generation Failed',
        error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dynamic Study Planner</h2>
        <p className="text-muted-foreground">
          Generate a personalized study schedule based on your exam date and preferences.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configure Your Plan</CardTitle>
            <CardDescription>
              Tell us your study preferences, and we'll create a custom schedule for you.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="examDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Exam Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-[240px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>When is your big day?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studyHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Study Hours: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={16}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        How many hours can you realistically study each day?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studyStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Study Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a study style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="focused">Focused Topic Blocks</SelectItem>
                          <SelectItem value="spaced_repetition">Spaced Repetition</SelectItem>
                          <SelectItem value="cramming">Last-Minute Cramming</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How do you prefer to learn?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an intensity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low (Relaxed Pace)</SelectItem>
                          <SelectItem value="medium">Medium (Consistent Effort)</SelectItem>
                          <SelectItem value="high">High (Intensive Focus)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How hard do you want to push yourself?
                      </FormDescription>
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
                      Generating Plan...
                    </>
                  ) : (
                    'Generate Study Plan'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Study Plan</CardTitle>
            <CardDescription>
              Follow this schedule to stay on track for your exam.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold">Generating your personalized plan...</p>
                <p className="text-muted-foreground">The AI is crafting your schedule.</p>
              </div>
            )}
            {!isLoading && !studyPlan && (
              <div className="flex flex-col items-center justify-center text-center h-96 rounded-lg border-2 border-dashed">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold">Your Plan Awaits</p>
                <p className="text-muted-foreground">
                  Fill out the form to generate your schedule.
                </p>
              </div>
            )}
            {studyPlan && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{studyPlan}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use server';

/**
 * @fileOverview Dynamic study plan generator.
 *
 * - generateStudyPlan - A function that generates a personalized study schedule.
 * - StudyPlanInput - The input type for the generateStudyPlan function.
 * - StudyPlanOutput - The return type for the generateStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyPlanInputSchema = z.object({
  examDate: z.string().describe('The date of the exam (YYYY-MM-DD).'),
  studyHours: z
    .number()
    .describe('The number of hours available for study per day.'),
  studyStyle: z
    .string()
    .describe(
      'The preferred study style (e.g., focused, spaced repetition, etc.).'
    ),
  intensity: z.string().describe('The desired study intensity (e.g., high, medium, low).'),
  syllabus: z.string().describe('The syllabus content.'),
});
export type StudyPlanInput = z.infer<typeof StudyPlanInputSchema>;

const StudyPlanOutputSchema = z.object({
  studySchedule: z.string().describe('The generated study schedule.'),
});
export type StudyPlanOutput = z.infer<typeof StudyPlanOutputSchema>;

export async function generateStudyPlan(input: StudyPlanInput): Promise<StudyPlanOutput> {
  return generateStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyPlanPrompt',
  input: {schema: StudyPlanInputSchema},
  output: {schema: StudyPlanOutputSchema},
  prompt: `You are an expert study plan generator. You will generate a personalized study schedule based on the following information:

Exam Date: {{{examDate}}}
Study Hours per Day: {{{studyHours}}}
Study Style: {{{studyStyle}}}
Intensity: {{{intensity}}}
Syllabus Content: {{{syllabus}}}

Consider the exam date, study hours, study style, intensity, and syllabus content to create an effective and efficient study schedule. The study schedule should include topic allocation, revision scheduling, and buffer days.

Ensure that the study schedule is well-structured and easy to follow. Provide specific recommendations for each day, including the topics to study, the amount of time to spend on each topic, and any relevant resources to use.

Output the study schedule in a readable format.
`,
});

const generateStudyPlanFlow = ai.defineFlow(
  {
    name: 'generateStudyPlanFlow',
    inputSchema: StudyPlanInputSchema,
    outputSchema: StudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

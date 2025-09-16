'use server';

/**
 * @fileOverview Generates flashcards for a given topic based on the syllabus content.
 *
 * - generateFlashcards - A function that generates flashcards.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  topic: z.string().describe('The topic to generate flashcards for.'),
  syllabusContent: z
    .string()
    .describe('The full content of the syllabus for context.'),
});
export type GenerateFlashcardsInput = z.infer<
  typeof GenerateFlashcardsInputSchema
>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z
    .array(
      z.object({
        question: z.string().describe('The front side of the flashcard (a question or term).'),
        answer: z.string().describe('The back side of the flashcard (the answer or definition).'),
      })
    )
    .describe('An array of generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<
  typeof GenerateFlashcardsOutputSchema
>;

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const flashcardPrompt = ai.definePrompt({
  name: 'flashcardPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an expert in creating educational materials. Based on the provided syllabus content, generate a set of 5-10 flashcards for the topic: {{{topic}}}.

Each flashcard should have a clear question and a concise answer. The goal is to help a student memorize key concepts, definitions, or formulas related to this topic.

Syllabus Context:
{{{syllabusContent}}}

Generate flashcards for the topic: {{{topic}}}.
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await flashcardPrompt(input);
    return output!;
  }
);

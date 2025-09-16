
'use server';
/**
 * @fileOverview An AI chatbot that answers syllabus-related questions, bounded by the uploaded syllabus content.
 *
 * - askQuestion - A function that handles the question answering process.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskQuestionInputSchema = z.object({
  syllabusContent: z
    .string()
    .describe('The content of the syllabus.'),
  question: z.string().describe('The question about the syllabus.'),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(input: AskQuestionInput): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: {schema: AskQuestionInputSchema},
  output: {schema: AskQuestionOutputSchema},
  prompt: `You are an expert AI tutor. Your task is to answer questions about the provided syllabus content.

When a question is a "what", "why", "when", "how" type of question, you must provide a concise answer of 4-5 sentences. Use bullet points where it helps to clarify the information.

Always base your answers strictly on the following syllabus content.

Syllabus Content:
{{{syllabusContent}}}

---

Question: {{{question}}}

Answer:`,
});

const askQuestionFlow = ai.defineFlow(
  {
    name: 'askQuestionFlow',
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

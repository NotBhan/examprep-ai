
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
  fromSyllabus: z.boolean().describe('Whether the answer was derived from the syllabus content.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(input: AskQuestionInput): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: {schema: AskQuestionInputSchema},
  output: {schema: AskQuestionOutputSchema},
  prompt: `You are an AI assistant. Your task is to answer questions strictly based on the provided syllabus content.

When a question is a "what", "why", "when", "how" type of question, you must provide a concise answer of 4-5 sentences based *only* on the text provided. Use bullet points where it helps to clarify the information.

1.  Analyze the 'Syllabus Content' below to find the answer to the 'Question'.
2.  If the answer is found, provide a concise summary. Set the 'fromSyllabus' flag to true.
3.  If the answer cannot be found in the syllabus content, you MUST respond with: "I could not find information about this topic in the provided syllabus." and set the 'fromSyllabus' flag to false.
4.  Do NOT use any external or general knowledge. Your response must be based solely on the provided text.

Syllabus Content:
{{{syllabusContent}}}

---

Question: {{{question}}}
`,
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

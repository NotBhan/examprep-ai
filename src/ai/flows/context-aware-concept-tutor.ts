
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
import {SyllabusMindMapSchema} from './syllabus-deconstructor';

const AskQuestionInputSchema = z.object({
  mindMap: SyllabusMindMapSchema.describe(
    'The structured syllabus mind map, containing topics, subtopics, definitions, and weightages.'
  ),
  question: z.string().describe('The question about the syllabus.'),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
  fromSyllabus: z
    .boolean()
    .describe('Whether the answer was derived from the syllabus content.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(
  input: AskQuestionInput
): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: {schema: AskQuestionInputSchema},
  output: {schema: AskQuestionOutputSchema},
  prompt: `You are an AI Tutor named Marika. Your purpose is to help students understand their course material by answering questions based *only* on the provided structured syllabus mind map.

You can explain concepts, summarize topics, compare and contrast different sections, and answer specific questions. Your answers should be clear, concise, and directly derived from the 'Syllabus Mind Map'. Use formatting like lists or bold text to improve readability.

1.  Thoroughly analyze the 'Syllabus Mind Map' to understand the context of the user's 'Question'. The mind map is a JSON object that contains all topics, subtopics, their definitions, and their importance (weightage).
2.  Formulate a helpful and accurate answer based exclusively on the provided mind map structure and content.
3.  If the syllabus genuinely does not contain information relevant to the question, and only in that case, you MUST respond with: "I could not find information about this topic in the provided syllabus." and set the 'fromSyllabus' flag to false.
4.  For all other questions where the information is present, answer it to the best of your ability and set the 'fromSyllabus' flag to true. Do not use any external knowledge.

Syllabus Mind Map (JSON format):
{{{json mindMap}}}

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

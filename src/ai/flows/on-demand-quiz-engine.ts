'use server';
/**
 * @fileOverview Generates quizzes on selected topics with customizable difficulty and number of questions, and provides AI-generated explanations for each answer.
 *
 * - generateQuiz - A function that generates a quiz based on the provided topic, difficulty, and number of questions.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz.'),
  numQuestions: z.number().int().min(1).max(20).describe('The number of questions in the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answers for the question.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
      explanation: z.string().describe('The AI-generated explanation for the correct answer.'),
    })
  ).describe('The generated quiz with questions, options, correct answers, and explanations.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const quizPrompt = ai.definePrompt({
  name: 'quizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz generator. Generate a quiz on the topic of {{topic}} with {{numQuestions}} questions. The difficulty level should be {{difficulty}}. For each question, provide a list of options, the correct answer, and an AI-generated explanation for the correct answer. The explanation should clearly explain why the correct answer is correct and why the other options are incorrect.

Ensure that the generated quiz adheres to the specified difficulty level and covers the key concepts of the topic.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await quizPrompt(input);
    return output!;
  }
);

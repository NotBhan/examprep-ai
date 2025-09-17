
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
  topic: z.string().describe('The topic for the quiz. If the topic is "Complete Syllabus", questions should cover the entire syllabus content.'),
  syllabusContent: z.string().describe('The full content of the syllabus for context.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the quiz.'),
  numQuestions: z.number().int().min(1).max(15).describe('The number of questions in the quiz.'),
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
  prompt: `You are an expert quiz generator. Your task is to generate a quiz based on the provided syllabus content.

Topic: {{topic}}
Difficulty: {{difficulty}}
Number of Questions: {{numQuestions}}

Syllabus Content for Context:
{{{syllabusContent}}}

Instructions:
1.  Generate a quiz with {{numQuestions}} questions.
2.  If the topic is "Complete Syllabus", the questions should cover a broad range of topics from the entire syllabus.
3.  If a specific topic is provided, focus the questions on that topic.
4.  For each question, provide a list of multiple-choice options, identify the correct answer, and write a clear explanation for why the correct answer is right and the others are wrong.
5.  Ensure the quiz difficulty matches the "{{difficulty}}" level.

Adhere strictly to the provided syllabus content for generating all questions, answers, and explanations.
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


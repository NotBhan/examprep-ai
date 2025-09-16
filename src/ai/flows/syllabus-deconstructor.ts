'use server';

/**
 * @fileOverview This file defines a Genkit flow for deconstructing an exam syllabus.
 *
 * The flow takes a syllabus file (PDF or text) as input, parses it using AI,
 * and generates an interactive syllabus mind map with topic weightage estimation.
 *
 * @exports {function} deconstructSyllabus - The main function to initiate the syllabus deconstruction flow.
 * @exports {type} DeconstructSyllabusInput - The input type for the deconstructSyllabus function.
 * @exports {type} DeconstructSyllabusOutput - The output type for the deconstructSyllabus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeconstructSyllabusInputSchema = z.object({
  syllabusDataUri: z
    .string()
    .describe(
      'The syllabus file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'. Supported file types: PDF, TXT.'
    ),
});
export type DeconstructSyllabusInput = z.infer<typeof DeconstructSyllabusInputSchema>;

const DeconstructSyllabusOutputSchema = z.object({
  mindMapData: z
    .string()
    .describe('A JSON string representing the interactive syllabus mind map. Includes topics, subtopics, and estimated weightage for each topic.'),
});
export type DeconstructSyllabusOutput = z.infer<typeof DeconstructSyllabusOutputSchema>;

export async function deconstructSyllabus(input: DeconstructSyllabusInput): Promise<DeconstructSyllabusOutput> {
  return deconstructSyllabusFlow(input);
}

const deconstructSyllabusPrompt = ai.definePrompt({
  name: 'deconstructSyllabusPrompt',
  input: {schema: DeconstructSyllabusInputSchema},
  output: {schema: DeconstructSyllabusOutputSchema},
  prompt: `You are an AI expert in exam syllabus analysis and mind map generation.

You will receive the content of an exam syllabus as input. Your task is to parse the syllabus content, identify the main topics and subtopics, and estimate the weightage of each topic based on its importance in the syllabus.

Create a JSON string representing an interactive syllabus mind map. The JSON should include:

- Topics: The main subjects covered in the syllabus.
- Subtopics: The detailed areas within each topic.
- Weightage: A numerical value (1-10) indicating the relative importance of the topic (1 being least important, 10 being most important).

Ensure that the JSON is valid and well-structured for creating an interactive mind map.

Syllabus Content: {{media url=syllabusDataUri}}`,
});

const deconstructSyllabusFlow = ai.defineFlow(
  {
    name: 'deconstructSyllabusFlow',
    inputSchema: DeconstructSyllabusInputSchema,
    outputSchema: DeconstructSyllabusOutputSchema,
  },
  async input => {
    const {output} = await deconstructSyllabusPrompt(input);
    return output!;
  }
);

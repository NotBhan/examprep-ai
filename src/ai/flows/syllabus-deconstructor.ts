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
import {z} from 'zod';
import type {SyllabusMindMap} from '@/lib/types';

const DeconstructSyllabusInputSchema = z.object({
  syllabusDataUri: z
    .string()
    .describe(
      'The syllabus file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'. Supported file types: PDF, TXT.'
    ),
});
export type DeconstructSyllabusInput = z.infer<
  typeof DeconstructSyllabusInputSchema
>;

const SyllabusSubTopicSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.object({
      topic: z.string(),
      definition: z.string().optional().describe('A concise one-line definition of the sub-topic.'),
      weightage: z.number().optional(),
      subtopics: z.array(SyllabusSubTopicSchema).optional(),
    }),
  ])
);

const SyllabusTopicSchema = z.object({
  topic: z.string(),
  weightage: z.number(),
  definition: z.string().optional().describe('A concise one-line definition of the topic.'),
  subtopics: z.array(SyllabusSubTopicSchema).optional(),
});

const SyllabusMindMapSchema = z.object({
  topics: z.array(SyllabusTopicSchema),
});

const DeconstructSyllabusOutputSchema = z.object({
  mindMap: SyllabusMindMapSchema.describe(
    'The interactive syllabus mind map with topics, subtopics, definitions, and weightage.'
  ),
});

export type DeconstructSyllabusOutput = z.infer<
  typeof DeconstructSyllabusOutputSchema
>;

export async function deconstructSyllabus(
  input: DeconstructSyllabusInput
): Promise<DeconstructSyllabusOutput> {
  return deconstructSyllabusFlow(input);
}

const deconstructSyllabusPrompt = ai.definePrompt({
  name: 'deconstructSyllabusPrompt',
  input: {schema: DeconstructSyllabusInputSchema},
  output: {schema: DeconstructSyllabusOutputSchema},
  prompt: `You are an AI expert in exam syllabus analysis and mind map generation. Your task is to parse the provided syllabus content, identify the main topics and subtopics, and estimate the weightage of each topic based on its importance. For each topic and sub-topic, you must also provide a concise, one-line definition.

You will receive the content of a syllabus file (like a PDF or TXT). Focus on extracting the core textual information and ignore any formatting artifacts, page numbers, or irrelevant details.

Create a structured mind map object with the following properties:
- \`topics\`: An array of main subjects.
- \`topic\`: The name of a subject.
- \`definition\`: A concise, one-line definition of the topic or sub-topic.
- \`weightage\`: A numerical value from 0 (least important) to 10 (most important). This should only be applied to main topics.
- \`subtopics\`: An array of detailed areas within each topic, which can be nested.

Ensure your output is a valid, well-structured object that conforms to the requested schema.

Syllabus Content: {{media url=syllabusDataUri}}`,
});

const deconstructSyllabusFlow = ai.defineFlow(
  {
    name: 'deconstructSyllabusFlow',
    inputSchema: DeconstructSyllabusInputSchema,
    outputSchema: DeconstructSyllabusOutputSchema,
  },
  async (input) => {
    const {output} = await deconstructSyllabusPrompt(input);
    return output!;
  }
);

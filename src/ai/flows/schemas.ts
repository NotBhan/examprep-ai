
import {z} from 'zod';

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

export const SyllabusMindMapSchema = z.object({
  topics: z.array(SyllabusTopicSchema),
});

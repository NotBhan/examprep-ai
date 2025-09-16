export type SyllabusSubTopic = string | {
  topic: string;
  definition?: string;
  weightage?: number;
  subtopics: SyllabusSubTopic[];
};

export type SyllabusTopic = {
  topic: string;
  definition?: string;
  weightage: number;
  subtopics: SyllabusSubTopic[];
};

export type SyllabusMindMap = {
  topics: SyllabusTopic[];
};

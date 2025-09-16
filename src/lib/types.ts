export type SyllabusSubTopic = string | {
  topic: string;
  weightage?: number;
  subtopics: SyllabusSubTopic[];
};

export type SyllabusTopic = {
  topic: string;
  weightage: number;
  subtopics: SyllabusSubTopic[];
};

export type SyllabusMindMap = {
  topics: SyllabusTopic[];
};



export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

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

// From on-demand-quiz-engine.ts
export type GenerateQuizInput = {
  topic: string;
  syllabusContent: string;
  difficulty: "easy" | "medium" | "hard";
  numQuestions: number;
};
export type GenerateQuizOutput = {
  quiz: {
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
  }[];
};

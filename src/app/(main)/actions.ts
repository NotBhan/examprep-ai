
'use server';

import { deconstructSyllabus } from '@/ai/flows/syllabus-deconstructor';
import { generateStudyPlan } from '@/ai/flows/dynamic-study-planner';
import { generateQuiz } from '@/ai/flows/on-demand-quiz-engine';
import { askQuestion } from '@/ai/flows/context-aware-concept-tutor';
import { generateFlashcards } from '@/ai/flows/flashcard-generator';

export async function deconstructSyllabusAction(syllabusDataUri: string) {
  try {
    const output = await deconstructSyllabus({ syllabusDataUri });
    return { success: true, data: output };
  } catch (error: any) {
    console.error('Error deconstructing syllabus:', error);
    return { success: false, error: error.message || 'Failed to deconstruct syllabus.' };
  }
}

export async function generateFlashcardsAction(
    input: Parameters<typeof generateFlashcards>[0]
) {
    try {
        const output = await generateFlashcards(input);
        return { success: true, data: output };
    } catch (error: any) {
        console.error('Error generating flashcards:', error);
        return { success: false, error: error.message || 'Failed to generate flashcards.' };
    }
}

export async function generateStudyPlanAction(
  input: Parameters<typeof generateStudyPlan>[0]
) {
  try {
    const output = await generateStudyPlan(input);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    return { success: false, error: error.message || 'Failed to generate study plan.' };
  }
}

export async function generateQuizAction(
  input: Parameters<typeof generateQuiz>[0]
) {
  try {
    const output = await generateQuiz(input);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    return { success: false, error: error.message || 'Failed to generate quiz.' };
  }
}

export async function askTutorAction(
  input: Parameters<typeof askQuestion>[0]
) {
  try {
    const output = await askQuestion(input);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('Error asking tutor:', error);
    return { success: false, error: error.message || 'Failed to get answer from tutor.' };
  }
}


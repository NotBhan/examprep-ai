# ExamPrep AI

ExamPrep AI is an intelligent study assistant designed to help students supercharge their exam preparation. By leveraging the power of generative AI, this application transforms a simple syllabus into a suite of powerful, interactive study tools.

## Features

- **Syllabus Deconstructor**: Upload your syllabus (PDF or TXT) to instantly generate an interactive mind map. The AI analyzes the content to identify main topics, subtopics, and even estimates the importance (weightage) of each, giving you a clear overview of your course structure.
- **Dynamic Study Planner**: Based on your deconstructed syllabus, generate a personalized study schedule. Customize it according to your exam date, available study hours, and preferred learning style.
- **On-Demand Quiz Engine**: Test your knowledge by generating quizzes on any topic from your syllabus. You can specify the difficulty level and the number of questions.
- **AI Flashcard Generator**: Create sets of flashcards for specific topics to reinforce key concepts, definitions, and formulas. It's a quick and effective way to memorize important information.
- **Context-Aware Concept Tutor**: Have a question about a topic in your syllabus? Ask the AI tutor. It provides explanations, examples, and comparisons, all within the context of your course material.

## Tech Stack

This project is built with a modern, robust, and scalable technology stack:

- **Frontend**:
  - [Next.js](https://nextjs.org/) (with App Router)
  - [React](https://reactjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
- **Styling**:
  - [Tailwind CSS](https://tailwindcss.com/)
  - [ShadCN UI](https://ui.shadcn.com/) for beautiful, accessible components.
- **Generative AI**:
  - [Genkit (by Firebase)](https://firebase.google.com/docs/genkit) for orchestrating AI flows.
  - [Google's Gemini Models](https://deepmind.google.com/technologies/gemini/) for powering the AI features.
- **Deployment**:
  - Ready for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## Getting Started

To get this project up and running on your local machine, follow these simple steps.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or later) and [npm](https://www.npmjs.com/) installed.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Create a `.env` file in the root of the project.
    - You will need a `GEMINI_API_KEY` from Google AI Studio.
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    The application consists of two main parts: the Next.js frontend and the Genkit AI flows. You'll need to run them concurrently in separate terminals.

    - **Terminal 1: Start the Next.js app:**
      ```bash
      npm run dev
      ```
      This will start the frontend on [http://localhost:9002](http://localhost:9002).

    - **Terminal 2: Start the Genkit flows:**
      ```bash
      npm run genkit:dev
      ```
      This starts the Genkit development server, making the AI flows available for the Next.js app.

Now you can open your browser and navigate to [http://localhost:9002](http://localhost:9002) to start using ExamPrep AI!

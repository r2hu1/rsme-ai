# ResumeAI Pro

ResumeAI Pro is a next-generation resume builder that leverages the power of generative AI to help you create, edit, and optimize your resume with ease. This application provides a seamless, real-time editing experience, AI-driven content analysis, and powerful customization options.

## Features

- **📄 AI-Powered Resume Parsing**: Instantly import your existing resume by pasting its text content. The AI will intelligently parse and structure the information for you.
- **✏️ Real-Time WYSIWYG Editing**: Edit any part of your resume directly in the live preview. All changes are saved automatically.
- **🎨 Customizable Layout & Theme**:
    - Toggle any section on or off.
    - Create and edit custom sections.
    - Drag and drop to reorder sections and individual items within them (experience, education, projects).
    - Customize the look and feel with a theme editor for colors and border widths.
- **✨ AI Content Analysis**: Get detailed feedback on your resume content, including:
    - Clarity Score
    - Grammar Score
    - Estimated ATS (Applicant Tracking System) Score
    - Actionable suggestions for improvement.
- **🤖 One-Click AI Fixes**: Automatically apply the AI's suggested fixes to your resume with a single click.
- **📊 Skill Scoring**: Paste a job description to get AI-powered relevance scores for your skills, helping you tailor your resume for specific roles.
- **🖨️ Print to PDF**: Easily print your resume or save it as a professional-looking PDF directly from the browser.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models.
- **Form Management**: [React Hook Form](https://react-hook-form.com/)
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (version 20 or later)
- [npm](https://www.npmjs.com/) or a compatible package manager

### 1. Set Up Environment Variables

You will need a Google AI API key to use the generative AI features.

1.  Create a file named `.env` in the root of the project.
2.  Add your API key to the `.env` file:
    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```
    You can obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Run the Development Servers

This project requires two development servers to be running simultaneously: one for the Next.js frontend and another for the Genkit AI flows.

- **Start the Next.js server:**
  ```bash
  npm run dev
  ```
  Your application will be available at `http://localhost:9002`.

- **In a separate terminal, start the Genkit server:**
  ```bash
  npm run genkit:watch
  ```
  This command starts the Genkit flows and watches for any changes you make to the AI logic.

You can now open your browser and navigate to `http://localhost:9002` to use the application.

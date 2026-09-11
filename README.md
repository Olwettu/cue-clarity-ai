# Cue Clarity

Build a premium AI productivity web app called 'Cue'. Use React and Tailwind CSS. The design must use a 'Light Pastel Gradient' aesthetic: a soft, airy background blending Lavender (#E6E6FA), Peach (#FFDAB9), Pale Yellow (#FFFACD), and Light Blue (#ADD8E6). Use Dark Charcoal (#1A1A1A) for all text. Use frosted glass cards with subtle white borders and soft drop shadows. Use 'Space Grotesk' for headlines and 'Inter' for body text.

UI/UX Layout:

- Sidebar Navigation: A permanent, minimal left-hand sidebar. 'Cue' logo at the top. Glassmorphic icon containers for 'Dashboard', 'Summary', and 'Chat'. The active tab should have a soft glowing highlight. On mobile, make it a collapsible hamburger menu.

- Header: 'Cue' logo and a greeting ('Good morning, [User]').

- Main Input: A large frosted-glass card titled 'Paste your chaos. Get your clarity.' with a subtext 'Drop your notes, ideas, tasks, links or questions...'. Include a glowing pastel 'Run Cue' button.

- Mission Control (Output): A frosted-glass card below the input. When 'Run Cue' is clicked, show a skeleton loading animation, then display the results here. Design the output as clean, stacked cards with tags for 'Critical Path', 'Blocking', etc.

- Floating Chat: A floating glass chat button in the bottom right corner that opens a 'Cue Assistant' window.

- Responsible AI Footer: Add a subtle but permanent disclaimer in the footer: 'AI generates suggestions, not decisions. Always review outputs for accuracy.'

AI Logic & Architecture (CRITICAL):

- Use the Groq API (model: openai/gpt-oss-120b, base URL: https://api.groq.com/openai/v1).

- CRITICAL FIX: To bypass mobile browser CORS errors, do NOT call the Groq API directly from the frontend. Create a secure backend proxy (an Edge Function or serverless function) that handles the API request. The frontend should call your backend function, which then calls Groq.

- Put the API key in a .env file as VITE_OPENAI_API_KEY and access it securely in the backend.

- Summarizer Prompt: 'You are a precision corporate assistant. Extract the following into a structured format: 1. A 3-bullet executive summary. 2. A table of Action Items (Task | Owner | Deadline | Priority). 3. Key Decisions made. If any detail is missing, label it as [Unknown] instead of making it up.'

- Chatbot Prompt: 'You are Cue, an AI Workplace Assistant. Use the provided context to answer the user's questions proactively.' (Do NOT instruct the AI to append a Responsible AI reminder to every message, as it ruins the user experience). Make the chat context-aware by passing the generated summary as context.

- Chat Formatting: Use a markdown parser (like react-markdown) so the chat output renders bold, italics, and lists beautifully without raw asterisks. Set the AI chat response text to text-sm (14px) for mobile elegance.

- State Persistence: Ensure the 'Run Cue' output in Mission Control does NOT disappear. Store it in a persistent state variable and ensure no cleanup function clears it.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cue-clarity-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4467d912-7a08-4e9f-9650-5b83ddb642b4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

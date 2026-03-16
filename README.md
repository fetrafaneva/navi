# Navi — AI Desktop Avatar Assistant

<div align="center">

![Navi Banner](https://img.shields.io/badge/Navi-AI%20Assistant-blueviolet?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?style=for-the-badge&logo=electron)
![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite)

*An interactive desktop AI avatar that speaks, answers your questions, and keeps you informed.*

</div>

---

## Features

-  **Voice synthesis** via the [ElevenLabs API](https://elevenlabs.io/) — Navi speaks to you with a realistic AI voice
-  **Smart Q&A** powered by [Google Generative AI (Gemini)](https://ai.google.dev/) — ask anything, get intelligent answers
-  **Live news feed** via [NewsAPI](https://newsapi.org/) — stay updated with the latest headlines
-  **Desktop app** built with Electron — runs natively on Windows, macOS, and Linux
-  **Blazing-fast dev experience** with Vite + HMR
-  **Type-safe** codebase with TypeScript
-  **Interactive avatar UI** — built with React 18

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Desktop Runtime | Electron |
| AI Chat | Google Generative AI (`@google/generative-ai`) |
| Voice Synthesis | ElevenLabs API |
| News Data | NewsAPI |
| Linting | ESLint |

---

## Required API Keys

Before running the app, you need to obtain the following API keys:

| Service | Where to get it | Environment variable |
|---|---|---|
| **Google Gemini** | [Google AI Studio](https://aistudio.google.com/app/apikey) | `VITE_GEMINI_API_KEY` |
| **ElevenLabs** | [ElevenLabs Dashboard](https://elevenlabs.io/) | `VITE_ELEVENLABS_API_KEY` |
| **NewsAPI** | [newsapi.org](https://newsapi.org/register) | `VITE_NEWS_API_KEY` |

Create a `.env` file at the root of the project:
```env
VITE_GEMINI_API_KEY=your_google_gemini_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
VITE_NEWS_API_KEY=your_newsapi_key_here
```

>  Never commit your `.env` file. It is already listed in `.gitignore`.

---

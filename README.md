# Soup Kitchen Volunteers — Volunteer Registration Form

ENG-72399 · Multi-step volunteer intake form, replacing paper/Excel-based registration for floor staff.

## What this is

A 4-step React form (Volunteer details → Availability → Roles → Review) that floor staff can pull up on any device to register a new volunteer. Built to stay usable on spotty connections and to fail safely rather than crash or lose entered data.

## Features

- **Multi-step flow** with progress indicator and per-step validation (custom regex, no external validation library)
- **Edge case handling**
  - Empty state messaging when no roles are available
  - Loading indicators for simulated async role fetch and submission
  - Simulated connection failure on submit (~12% of attempts) that preserves entered data and lets the user retry
  - Invalid/missing fields block progression and are highlighted with inline error text
- **Accessibility**: ARIA labels and roles on all interactive elements, live region announcements on step change and errors, full keyboard navigation, visible focus states, `prefers-reduced-motion` support
- **Security**: all free-text input is sanitized (HTML-escaped, protocol-stripped, length-capped) before being stored in state
- **Telemetry (simulated)**: logs `[Analytics] User interacted with Multi-Step Validation` to console on successful submission
- **Design**: monochromatic, no external color/font dependencies, consistent 16/32px spacing scale

## Tech stack

- React 18 + Vite
- No external form/validation libraries — controlled components and hand-written regex only
- Plain CSS (scoped via a single `<style>` block) — no CSS framework

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to /dist
npm run lint      # ESLint, zero warnings required
```

## Project structure

```
soup-kitchen-volunteer-form/
├── src/
│   ├── VolunteerIntakeForm.jsx   # main form component
│   └── main.jsx                  # React entry point
├── index.html
├── package.json
├── vite.config.js
├── .eslintrc.cjs
└── .gitignore
```

## Deployment

This is a static-built SPA (`npm run build` → `/dist`) and can be deployed to any static host:

- **Vercel**: import the repo, framework preset "Vite", no config needed
- **Netlify**: build command `npm run build`, publish directory `dist`
- **Render (Static Site)**: build command `npm run build`, publish directory `dist`

No environment variables or API keys are required — this version simulates network/analytics behavior client-side.

## Definition of Done

- [x] Compiles and runs without fatal errors
- [x] Passes lint with zero ESLint warnings
- [x] Happy and unhappy path acceptance criteria implemented
- [x] No API keys or PII hardcoded in source

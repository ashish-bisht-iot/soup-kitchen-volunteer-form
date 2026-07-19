# Soup Kitchen Volunteers — Volunteer Registration Form

Multi-step volunteer intake form, replacing paper/Excel-based registration for floor staff.

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

**Live Demo:** [https://soup-kitchen-volunteer-form.onrender.com](https://soup-kitchen-volunteer-form.onrender.com)

**Repo:** [https://github.com/ashish-bisht-iot/soup-kitchen-volunteer-form](https://github.com/ashish-bisht-iot/soup-kitchen-volunteer-form)
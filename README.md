<div align="center">
  <img src="./public/logo_dark.png" alt="Flow Task Manager Logo" width="120" />
  <h1>Flow Task Manager</h1>
  
  <img src="https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwind-css&logoColor=38B2AC" />
  <img src="https://img.shields.io/badge/Vite-2F2F2F?style=for-the-badge&logo=vite&logoColor=646CFF" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</div>

# Flow Task Manager - Frontend

A dark-themed, responsive **Kanban and project dashboard** built with **Vue 3**. The app focuses on fast interaction patterns (drag and drop, instant feedback states) and a clean UI system designed for real-world task and project tracking.

## Why this project exists

This repository is meant to showcase how I build modern frontend applications end-to-end.

- A product-style UI with a real navigation shell and protected routes
- Scalable state management patterns with Pinia
- A Kanban experience with task cards, columns, and a details flow
- A dashboard view using charts and summary widgets

## Tech stack

Vue 3, Vite, Pinia, pinia-plugin-persistedstate, Tailwind CSS, Chart.js

## Key features

Authentication-aware routing and protected screens.

Kanban board with draggable task cards across lifecycle columns.

Task creation/editing and details presentation.

Dashboard widgets and charts for project health and activity.

Loading, empty, and error states handled consistently.

## Project structure

`src/views` for pages.

`src/components` for reusable UI, including `components/kanban` for board-related components.

`src/stores` for Pinia stores (auth, tasks/kanban).

`src/router` for routes and navigation guards.

`src/utils` for API helpers and shared utilities.

## Getting started

### Prerequisites

Node.js 18+ recommended.

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## Environment variables

Create a `.env` file at the project root.

```bash
VITE_API_BASE_URL=http://localhost:5000
```

If your backend uses JWT or sessions, the frontend is set up to store auth state in a persisted Pinia store and attach auth headers through a centralized API helper.

## Screens

Login.

Dashboard.

Kanban board.

## Notes on implementation

State is centralized in Pinia stores so components stay focused on UI.

Auth protection is implemented with route meta and navigation guards.

The UI is Tailwind-driven with consistent spacing, typography, and dark theme tokens.

## Roadmap

Playwright end-to-end tests.

Accessibility pass with keyboard-friendly interactions.

Role-based permissions.

## Author

Kawtar Bidarine

Portfolio https://kawtarbidarine.neocities.org/projects
# Vinsys Assessment & Training Portal — Demo Prototype

A frontend-only, fully navigable demo of the Vinsys Assessment and Training Portal.
No backend, no API calls, no database — all data is hardcoded in `src/mock/` and all
state lives in Zustand + `localStorage`.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS (custom maroon/neutral theme)
- React Router v6
- Zustand (auth + assessment state)
- Monaco Editor (coding IDE)
- Recharts (charts)
- react-markdown (module content)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Demo credentials

The login page lists these and lets you click any row to autofill the form.

| Role    | Email                | Password      |
|---------|----------------------|---------------|
| Admin   | admin@vinsys.com     | Admin@123     |
| Trainer | trainer@vinsys.com   | Trainer@123   |
| HR      | hr@vinsys.com        | HR@123        |
| Student | student1@vinsys.com  | Student@123   | (Arjun Mehta — has results)
| Student | student2@vinsys.com  | Student@123   | (Priya Sharma — has results)
| Student | student3@vinsys.com  | Student@123   | (Rahul Nair — not attempted)

## Notes for reviewers

- **Student flow:** complete all 4 modules under *My Course* (Mark as Complete) to
  unlock the assessment, then run the proctored session with timer, webcam thumbnail,
  tab-switch detection, and the question navigator.
- **Persistence:** sessions, attempt progress, and module completion survive a page
  refresh (stored in `localStorage`). The assessment timer resumes from the correct
  remaining time after a refresh.
- All "create"/"add" actions show a success toast and update the visible UI. Locally
  added rows reset on refresh — expected for a demo.
- Camera/microphone use the real `getUserMedia` API; if access is denied the UI falls
  back gracefully to placeholders.

# Handwriting Recognizer — React + TypeScript + Tailwind (Vite)

This refactors your original React/Vite app to **TypeScript** and **Tailwind CSS** while keeping behavior the same.

## Quick start

```bash
npm i
npm run dev
```

> The frontend expects a backend at `VITE_API_URL` with a `/predict` endpoint that accepts a PNG in a `form-data` field named `image` and returns:
>
> ```json
> { "predicted": "23435", "boxes": [[x1,y1,x2,y2], ...], "per_digit": [{"digit":2,"prob":0.98}] }
> ```

## Files to note

-   `src/App.tsx` — Canvas drawing & request logic rewritten in TypeScript.
-   `src/main.tsx` — React 18 entry.
-   `tailwind.config.ts` + `postcss.config.js` — Tailwind setup.
-   `src/index.css` — Tailwind entry file (`@tailwind base; @tailwind components; @tailwind utilities;`).
-   `index.html` — Now loads `/src/main.tsx` and applies Tailwind classes to `<body>`.

## Environment

Create a `.env` in the project root (already included here if you had one):

```env
VITE_API_URL=http://localhost:8000
```

## Differences vs original

-   Replaced custom CSS with Tailwind utility classes but preserved your palette.
-   Converted `App.jsx` and `main.jsx` to `App.tsx` and `main.tsx` with strict types.
-   Kept the white canvas background to avoid transparent PNGs affecting recognition.
-   Two stacked canvases remain: the drawing layer and a top **box** overlay for predictions.

## Build

```bash
npm run build
npm run preview
```

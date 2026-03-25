# Report Generation System

A Next.js application designed to auto-generate student reports based on detailed categorical performance indicators.

## Features:
- **Batch Management**: Create, view, and delete batches of students.
- **Student Management**: Add students manually or import large sets directly from CSV or Excel (XLSX) format.
- **Dynamic Categorization & Remarks**: Easily categorize students as Good, Above Average, Average, or Poor.
- **Contextual Data Fields**: Dependent form controls matching logic requirements for each selected category.

## Technical Stack
- Next.js (App Router)
- React
- Tailwind CSS
- Lucide React (Icons)
- XLSX (Sheet processing)
- UUID (Unique identifiers)

## Scripts

- `npm run dev`: Start development server on port 3000.
- `npm run build`: Build production optimized server.
- `npm run start`: Launch the production compiled app.
- `npm run lint`: Run ESLint checks.

## Quick Start
1. Select the VS Code task `Next.js: Next Dev` or run `npm run dev` in your terminal.
2. Go to `http://localhost:3000` to start creating batches and importing/creating students.

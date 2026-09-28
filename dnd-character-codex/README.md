# D&D Character Codex App

This folder contains the React/Vite frontend for D&D Character Codex.

## Local Commands

```powershell
npm install
npm run dev
npm run build
npm run lint
```

## Environment Variables

Create a local `.env` file in this folder:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit `.env`. Use `.env.example` as the safe template.

## Supabase Setup

Run `supabase-schema.sql` in the Supabase SQL Editor to create the `characters` table and sample data. Run `supabase-demo-rls-policies.sql` if you need to reapply demo write policies.

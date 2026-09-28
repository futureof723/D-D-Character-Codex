# D&D Character Codex

D&D Character Codex is a web-based fantasy character encyclopedia where users can browse detailed character profiles containing information such as species, class, alignment, history, abilities, and affiliations. The application stores character records in a Supabase cloud database and supports creating, reading, updating, deleting, searching, and filtering character entries.

## Purpose

This project was built for a college web application assignment. The goal was to create a small, usable CRUD app with a cloud database, meaningful source control history, deployment readiness, and clear documentation.

## Features

- Browse fantasy character records from Supabase
- View detailed character profiles
- Search characters by name
- Filter characters by class or species
- Add new character records
- Edit existing character records
- Delete records with a confirmation message
- Responsive fantasy archive-inspired interface
- Demo Row Level Security policies for public CRUD access

Authentication was considered, but this version skips login to keep the student prototype simple and testable. A future version could add Supabase Auth so only signed-in users can create, edit, and delete records.

## Technologies Used

- React
- Vite
- JavaScript
- CSS
- Supabase
- GitHub
- Netlify

## Database Information

The main data entity is `Character`.

The Supabase table is named `characters` and includes:

- `id`
- `name`
- `species`
- `class`
- `alignment`
- `background`
- `biography`
- `abilities`
- `affiliation`
- `status`
- `image_url`
- `notes`
- `created_at`

SQL setup files are included:

- [dnd-character-codex/supabase-schema.sql](dnd-character-codex/supabase-schema.sql)
- [dnd-character-codex/supabase-demo-rls-policies.sql](dnd-character-codex/supabase-demo-rls-policies.sql)

The demo policies allow public create, update, and delete operations for class demonstration purposes. Do not expose Supabase service-role keys in frontend code.

## Installation And Setup

Clone the repository:

```powershell
git clone https://github.com/futureof723/D-D-Character-Codex.git
cd D-D-Character-Codex\dnd-character-codex
```

Install dependencies:

```powershell
npm install
```

## Environment Variables

Create a `.env` file inside [dnd-character-codex](dnd-character-codex):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the Supabase Project URL and anon public key from Supabase Project Settings. The `.env` file is ignored by Git and should not be committed.

## Run Locally

From the app folder:

```powershell
npm run dev
```

Open the local Vite URL, usually:

```text
http://127.0.0.1:5173/
```

## Build And Preview

```powershell
npm run build
npm run preview
```

## Deployment

The project is prepared for Netlify deployment with [netlify.toml](netlify.toml).

Netlify settings:

- Base directory: `dnd-character-codex`
- Build command: `npm run build`
- Publish directory: `dnd-character-codex/dist`

Add these environment variables in Netlify:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Links

- GitHub repository: https://github.com/futureof723/D-D-Character-Codex
- Deployed application: To be added after Netlify deployment
- Demo video: To be added after recording

## Screenshots

Screenshots will be added after deployment.

Suggested screenshots:

- Home and character list
- Character details view
- Add/edit character form
- Mobile layout

## What I Learned

- How to build a React app with Vite
- How to connect a frontend app to Supabase
- How Row Level Security affects database reads and writes
- How to implement CRUD features with a cloud database
- How to use Git and GitHub throughout development
- How to prepare a frontend app for Netlify deployment

## Future Improvements

- Add Supabase Authentication
- Restrict create, update, and delete actions to logged-in users
- Add separate routes for character details and forms
- Add image upload support
- Add sorting and pagination for larger character collections
- Improve test coverage

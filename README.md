# Margdarshak khoj Landing Website

React + Tailwind CSS + Supabase landing website for an MHT-CET counselling startup.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and add your Supabase project URL and anon key.

3. Run `supabase/schema.sql` in the Supabase SQL editor.

4. Start local development:

   ```bash
   npm run dev
   ```

## Supabase Flow

Registration uses Supabase Auth for the email and password. The selected plan is `Explorer`, `Guide`, or `Group`. The `students` row is created from Auth user metadata by the database trigger in `supabase/schema.sql`, and the frontend also upserts the profile when Supabase returns an active session.

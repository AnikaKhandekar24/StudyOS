# Email backend setup

StudyOS is hosted on GitHub Pages, which cannot safely store email provider keys
or run scheduled reminder jobs.

To enable real welcome and deadline emails, connect:

1. Supabase Auth and Postgres for user accounts and assignments.
2. A Supabase Edge Function using Resend for outbound email.
3. A daily Supabase Cron job that selects incomplete assignments due within the
   reminder window and invokes the reminder function.

Never place a Resend or Supabase service-role key in Vite environment variables
or client-side source code. Those secrets belong only in Edge Function secrets.

The current sign-up/sign-in flow is a local showcase fallback. It hashes
passwords before browser storage, but it is not a replacement for server-side
authentication.

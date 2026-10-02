# FollowFlow

Production SaaS foundation for lead capture, pipeline management and follow-up.

Stack: Next.js, TypeScript, Supabase Auth/Postgres/RLS.

Setup:
1. Create a Supabase project.
2. Run supabase/schema.sql in the SQL Editor.
3. Copy .env.example to .env.local.
4. Add the Supabase URL and publishable key.
5. Run npm install and npm run dev.

Deploy:
Import this repository into Vercel and add the two Supabase environment variables.

Security:
Every business-owned record contains business_id and database RLS policies restrict access to the authenticated business owner. Do not put service-role keys in browser code.

Messaging:
WhatsApp, Instagram and Facebook sending is not faked. Integrations are pending until a real provider is connected.

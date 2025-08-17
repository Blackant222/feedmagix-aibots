# 🔑 Get Your Supabase Anon Key

## Quick Steps:

1. **Go to your Supabase project:**
   https://supabase.com/dashboard/project/nxhsodmddjrsjgcqmzok

2. **Navigate to Settings:**
   - Click **Settings** in the left sidebar
   - Click **API** 

3. **Copy the anon key:**
   - Find **Project API keys**
   - Copy the **anon** **public** key (starts with `eyJ...`)
   - It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aHNvZG1kZGpyc2pnY3Ftem9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTU0NzAsImV4cCI6MjA1MDAzMTQ3MH0.SIGNATURE_HERE`

4. **Update your Railway environment variables:**
   ```
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aHNvZG1kZGpyc2pnY3Ftem9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTU0NzAsImV4cCI6MjA1MDAzMTQ3MH0.YOUR_SIGNATURE
   ```

## Setup Database Tables:

1. **Go to SQL Editor:**
   https://supabase.com/dashboard/project/nxhsodmddjrsjgcqmzok/sql

2. **Copy and paste the entire content from `supabase-setup.sql`**

3. **Click Run** to create all tables

## That's it! 🎉

Your database is ready for the PetMagix AI team!
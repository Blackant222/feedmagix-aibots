# 🚀 DEPLOY NOW - Step by Step Guide

## ✅ What's Already Done:
- ✅ GitHub repo ready: https://github.com/Blackant222/feedmagix-aibots.git
- ✅ All 6 bot tokens configured
- ✅ OpenAI API key set
- ✅ Your Telegram details added (Group: -1003073936969, User: 691122097)
- ✅ Redis credentials configured

## 🎯 STEP 1: Get Supabase Anon Key (2 minutes)

### 1.1 Open Supabase Dashboard
- Go to: https://supabase.com/dashboard/project/nxhsodmddjrsjgcqmzok
- Login if needed

### 1.2 Get Your Anon Key
- Click **"Settings"** in left sidebar
- Click **"API"** 
- Find **"Project API keys"** section
- Copy the **"anon public"** key (starts with `eyJ...`)
- It's a long string like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54aHNvZG1kZGpyc2pnY3Ftem9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0NTU0NzAsImV4cCI6MjA1MDAzMTQ3MH0.SIGNATURE_HERE`

### 1.3 Save It
- Copy this key, you'll need it in Step 3

---

## 🎯 STEP 2: Setup Database Tables (1 minute)

### 2.1 Open SQL Editor
- In same Supabase dashboard, click **"SQL Editor"** in left sidebar

### 2.2 Run Setup Script
- Click **"New query"**
- Copy ALL the content from your `supabase-setup.sql` file
- Paste it in the SQL editor
- Click **"Run"** button
- You should see: "Success. No rows returned"

---

## 🎯 STEP 3: Deploy to Railway (5 minutes)

### 3.1 Open Railway
- Go to: https://railway.app
- Click **"Login"** 
- Choose **"Login with GitHub"**

### 3.2 Create New Project
- Click **"New Project"**
- Click **"Deploy from GitHub repo"**
- Find and select: **"Blackant222/feedmagix-aibots"**
- Click **"Deploy Now"**

### 3.3 Set Environment Variables
- Wait for initial deploy (will fail, that's ok)
- Click **"Variables"** tab
- Click **"New Variable"** and add these ONE BY ONE:

```
COORDINATOR_BOT_TOKEN
8359472965:AAFB51Dy8evtQQqqGR-LqtBUGXffmY_uW7s

SARA_BOT_TOKEN
8355696756:AAHmCSjrbpGW6kYNzEq0rNs3eq5yFMN4tH0

AMIR_BOT_TOKEN
8063660866:AAFtXt6NpkKA95WdqhQ88_kUXtrWoDLSHuM

LALEH_BOT_TOKEN
8438985652:AAH0_GaC1BpFG3Dxii4QmDLeDbiTkp_1Q8o

NAVID_BOT_TOKEN
8050503570:AAH0utITyGbkcmN9Cw1QaAiAlFysCMfvygw

NEDA_BOT_TOKEN
8409099374:AAHMl-UsikHCVE1V9dC8Ghqfle7ggBYIxfQ

OPENAI_API_KEY
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

SUPABASE_URL
https://nxhsodmddjrsjgcqmzok.supabase.co

SUPABASE_ANON_KEY
[PASTE THE KEY YOU COPIED FROM STEP 1.2]

REDIS_USERNAME
default

REDIS_PASSWORD
33rF1pkEpRvWzfK9lWqnmSPV1KHSIy8Y

REDIS_HOST
redis-17337.c84.us-east-1-2.ec2.redns.redis-cloud.com

REDIS_PORT
17337

GROUP_CHAT_ID
-1003073936969

CEO_USER_ID
691122097

PORT
3000
```

### 3.4 Redeploy
- After adding all variables, click **"Deploy"** button
- Wait 2-3 minutes for build to complete

---

## 🎯 STEP 4: Test Your AI Team (2 minutes)

### 4.1 Check Railway Logs
- In Railway, click **"Logs"** tab
- Look for these success messages:
```
✅ Supabase connected
✅ Redis connected
✅ coordinator bot initialized
✅ sara bot initialized
✅ amir bot initialized
✅ laleh bot initialized
✅ navid bot initialized
✅ neda bot initialized
🌐 Server running on port 3000
✅ PetMagix AI Team ready!
```

### 4.2 Test in Telegram Group
- Go to your Telegram group (ID: -1003073936969)
- Send: `/start`
- You should see a welcome message from the Coordinator bot

### 4.3 Test Agent Commands
- Try: `@sara create marketing campaign`
- Try: `Sara, help with Instagram strategy`
- Try: `/status` to see team status

---

## 🎯 STEP 5: Setup Keep-Alive (2 minutes)

### 5.1 Get Your Railway URL
- In Railway dashboard, click **"Settings"** tab
- Copy your app URL (looks like: `https://feedmagix-aibots-production.up.railway.app`)

### 5.2 Add GitHub Secret
- Go to: https://github.com/Blackant222/feedmagix-aibots/settings/secrets/actions
- Click **"New repository secret"**
- Name: `RAILWAY_APP_URL`
- Value: `https://your-app-url.railway.app` (paste your actual URL)
- Click **"Add secret"**

---

## 🎉 SUCCESS INDICATORS

### ✅ Railway Logs Show:
```
🚀 Starting PetMagix AI Team...
✅ Supabase connected
✅ Redis connected
✅ All 6 bots initialized
🌐 Server running on port 3000
✅ PetMagix AI Team ready!
```

### ✅ Telegram Group Shows:
```
🎯 PetMagix AI Team briefing complete!

✅ Company profile loaded
✅ Agent personalities initialized
✅ FeedMagix context distributed

Your AI team is ready to help grow PetMagix! 🐾
```

### ✅ Health Check Works:
- Visit: `https://your-app.railway.app/health`
- Should return JSON with "status": "healthy"

---

## 🚨 TROUBLESHOOTING

### If Bots Don't Respond:
1. Check all bots are **administrators** in your group
2. Verify GROUP_CHAT_ID is correct: `-1003073936969`
3. Check Railway logs for errors

### If Database Errors:
1. Make sure you ran the SQL script in Step 2
2. Verify SUPABASE_ANON_KEY is correct

### If Build Fails:
1. Check all environment variables are set in Railway
2. Look at Railway logs for specific error messages

---

## 🎯 READY TO GO!

Once all steps are complete, your PetMagix AI team will be:
- ✅ Running 24/7 on Railway
- ✅ Responding to commands in your Telegram group
- ✅ Cost-optimized (only $5-15/month for OpenAI)
- ✅ Ready to help grow FeedMagix!

**Your AI workforce is ready to launch your pet care empire!** 🐾

---

## 📞 NEED HELP?

If you get stuck on any step, tell me:
1. Which step number you're on
2. What error message you see
3. Screenshot if helpful

I'll help you fix it immediately!
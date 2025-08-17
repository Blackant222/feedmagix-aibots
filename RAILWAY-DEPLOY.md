# 🚀 Railway Deployment Guide

## Quick Deploy to Railway (5 minutes)

### 1. Prepare Your GitHub Repository
Your repo is ready: https://github.com/Blackant222/feedmagix-aibots.git

### 2. Connect to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your repository: `Blackant222/feedmagix-aibots`

### 3. Set Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```env
# Telegram Bot Tokens (already in your repo)
COORDINATOR_BOT_TOKEN=8359472965:AAFB51Dy8evtQQqqGR-LqtBUGXffmY_uW7s
SARA_BOT_TOKEN=8355696756:AAHmCSjrbpGW6kYNzEq0rNs3eq5yFMN4tH0
AMIR_BOT_TOKEN=8063660866:AAFtXt6NpkKA95WdqhQ88_kUXtrWoDLSHuM
LALEH_BOT_TOKEN=8438985652:AAH0_GaC1BpFG3Dxii4QmDLeDbiTkp_1Q8o
NAVID_BOT_TOKEN=8050503570:AAH0utITyGbkcmN9Cw1QaAiAlFysCMfvygw
NEDA_BOT_TOKEN=8409099374:AAHMl-UsikHCVE1V9dC8Ghqfle7ggBYIxfQ

# OpenAI API (already in your repo)
OPENAI_API_KEY=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

# Supabase Database
SUPABASE_URL=https://nxhsodmddjrsjgcqmzok.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE

# Redis Cloud
REDIS_USERNAME=default
REDIS_PASSWORD=33rF1pkEpRvWzfK9lWqnmSPV1KHSIy8Y
REDIS_HOST=redis-17337.c84.us-east-1-2.ec2.redns.redis-cloud.com
REDIS_PORT=17337

# Telegram Group (YOU NEED TO SET THESE)
GROUP_CHAT_ID=-1001234567890
CEO_USER_ID=your_telegram_user_id

# Server
PORT=3000
```

### 4. Get Missing Values

#### Supabase Anon Key:
1. Go to your Supabase project: https://supabase.com/dashboard/project/nxhsodmddjrsjgcqmzok
2. Go to **Settings** → **API**
3. Copy the **anon/public** key (starts with `eyJ...`)

#### Telegram Group Chat ID:
1. Create a Telegram group
2. Add all 6 bots as administrators
3. Add @userinfobot to the group
4. Send any message
5. Copy the group ID (negative number like `-1001234567890`)

#### Your Telegram User ID:
1. Message @userinfobot privately
2. Copy your user ID

### 5. Deploy!
1. Click **Deploy** in Railway
2. Wait 2-3 minutes for build
3. Check **Logs** for success messages:
   ```
   ✅ Supabase connected
   ✅ Redis connected
   ✅ PetMagix AI Team ready!
   ```

### 6. Setup Keep-Alive (Prevent Sleeping)
1. In your GitHub repo, go to **Settings** → **Secrets**
2. Add secret: `RAILWAY_APP_URL` = `https://your-app.railway.app`
3. The GitHub Action will ping every 25 minutes automatically

### 7. Test Your AI Team
1. Go to your Telegram group
2. Send: `/start`
3. Try: `@sara create marketing campaign`
4. Test: `Sara, help with Instagram strategy`

## 🎉 Success Indicators

### In Railway Logs:
```
🚀 Starting PetMagix AI Team...
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

### In Telegram Group:
```
🎯 PetMagix AI Team briefing complete!

✅ Company profile loaded
✅ Agent personalities initialized
✅ FeedMagix context distributed

Your AI team is ready to help grow PetMagix! 🐾

Try: @sara create Instagram campaign
Or: Sara, what's our marketing strategy?
```

## 🔧 Troubleshooting

### Common Issues:

**Build Failed:**
- Check all environment variables are set
- Verify bot tokens are correct

**Bots Not Responding:**
- Ensure bots are administrators in group
- Check GROUP_CHAT_ID is correct (negative number)
- Verify all bot tokens

**Database Errors:**
- Run the SQL from `supabase-setup.sql` in Supabase SQL Editor
- Check SUPABASE_URL and SUPABASE_ANON_KEY

**Redis Connection Failed:**
- Verify Redis credentials
- Check Redis Cloud dashboard for connection details

### Health Check:
Visit: `https://your-app.railway.app/health`
Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-17T...",
  "service": "PetMagix AI Team",
  "bots": ["coordinator", "sara", "amir", "laleh", "navid", "neda"]
}
```

## 💰 Cost Monitoring

**Railway Free Tier:**
- 500 hours/month (enough for 24/7 operation)
- $0.000463/GB-hour for storage
- Keep-alive prevents sleeping

**Expected Monthly Costs:**
- Railway: $0 (free tier sufficient)
- Supabase: $0 (free tier)
- Redis: $0 (free tier)
- OpenAI API: $5-15 (usage-based)
- **Total: $5-15/month**

## 🚀 You're Live!

Your PetMagix AI team is now running 24/7 on Railway, ready to:
- Create marketing campaigns for FeedMagix
- Write compelling Persian content
- Analyze performance metrics
- Plan development sprints
- Research market opportunities

**Start growing PetMagix today!** 🐾
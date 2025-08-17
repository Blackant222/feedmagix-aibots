# 🐾 PetMagix Telegram AI Team

Your complete AI workforce for growing PetMagix and launching FeedMagix!

## 🚀 Quick Deploy

### 1. Create 6 Telegram Bots
```bash
# Message @BotFather on Telegram:
/newbot
# Create: petmagix_coordinator_bot, petmagix_sara_bot, petmagix_amir_bot, 
#         petmagix_laleh_bot, petmagix_navid_bot, petmagix_neda_bot
```

### 2. Setup Free Infrastructure
- **Supabase**: Free PostgreSQL 500MB + realtime
- **Redis Cloud**: Free 30MB database  
- **Railway**: Free 500 hours/month hosting

### 3. Deploy to Railway
```bash
# 1. Fork this repo
# 2. Connect to Railway
# 3. Set environment variables:

COORDINATOR_BOT_TOKEN=your_coordinator_token
SARA_BOT_TOKEN=your_sara_token
AMIR_BOT_TOKEN=your_amir_token
LALEH_BOT_TOKEN=your_laleh_token
NAVID_BOT_TOKEN=your_navid_token
NEDA_BOT_TOKEN=your_neda_token

OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
REDIS_URL=redis://user:pass@host:port

GROUP_CHAT_ID=-1001234567890
CEO_USER_ID=your_telegram_user_id
```

### 4. Add Bots to Telegram Group
1. Create Telegram group
2. Add all 6 bots as administrators
3. Send `/start` - team activates automatically!

## 🤖 Your AI Team

| Agent | Role | Specialty | Trigger Words |
|-------|------|-----------|---------------|
| 🎯 **Sara** | Marketing Strategist | Persian market, Instagram, campaigns | marketing, campaign, strategy |
| ✍️ **Amir** | Creative Copywriter | Emotional content, Persian copy | copy, content, writing, story |
| 📊 **Laleh** | Analytics Specialist | Data analysis, metrics, ROI | analytics, data, metrics, performance |
| ⚙️ **Navid** | COO | Operations, sprints, coordination | plan, sprint, operations, coordinate |
| 🔍 **Neda** | Market Analyst | Research, trends, opportunities | research, market, trends, competition |

## 💬 Usage Examples

```
# Direct commands
@sara create Instagram campaign for FeedMagix launch
@amir write emotional copy about pet food safety
@laleh analyze our conversion funnel

# Natural conversation  
Sara, what's our best strategy for Persian pet owners?
Amir, help with landing page copy that converts
Laleh, how are our metrics performing?

# Team commands
/status - View team workload
/briefing - Initialize team knowledge
```

## 🧠 Smart Features

- **Cost-optimized AI routing**: Uses cheapest models automatically
- **Context memory**: 24-hour conversation awareness
- **Team collaboration**: Agents work together seamlessly
- **Bilingual support**: Persian/English as appropriate
- **Rate limiting**: Prevents API abuse
- **Auto-briefing**: Loads company knowledge on startup

## 💰 Cost Breakdown

**Monthly Costs:**
- Infrastructure: **$0** (free tiers)
- OpenAI API: **$10-30** (usage-based)
- **Total: $10-30/month**

**Free Infrastructure:**
- Railway: 500 hours/month
- Supabase: 500MB PostgreSQL + 2GB bandwidth
- Redis Cloud: 30MB forever

## 🔧 Keep-Alive Setup

Add to GitHub Secrets:
```
RAILWAY_APP_URL=https://your-app.railway.app
```

GitHub Action pings `/health` every 25 minutes to prevent Railway sleeping.

## 📊 Monitoring

- Health check: `https://your-app.railway.app/health`
- Railway logs: `railway logs --tail`
- OpenAI usage: https://platform.openai.com/usage

## 🎯 Ready to Launch!

Your PetMagix AI team is ready to:
- Create marketing campaigns for FeedMagix
- Write compelling Persian content
- Analyze performance metrics
- Plan development sprints
- Research market opportunities

**Start growing PetMagix today!** 🐾
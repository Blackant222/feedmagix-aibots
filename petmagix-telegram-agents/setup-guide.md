# 🚀 PetMagix Telegram AI Agents Setup Guide

## Prerequisites

1. **Telegram Bot Tokens** (6 bots needed)
2. **OpenAI API Key** with access to specified models
3. **MongoDB Atlas** free tier account
4. **Redis Cloud** free tier account
5. **Railway** or **Render** free tier account

## Step 1: Create Telegram Bots

Create 6 bots using [@BotFather](https://t.me/botfather):

```
/newbot
Bot Name: PetMagix Coordinator
Username: petmagix_coordinator_bot

/newbot  
Bot Name: Sara Mehr - Marketing
Username: petmagix_sara_bot

/newbot
Bot Name: Amir Kaviani - Copywriter  
Username: petmagix_amir_bot

/newbot
Bot Name: Laleh Shadmehr - Analytics
Username: petmagix_laleh_bot

/newbot
Bot Name: Navid Ramin - COO
Username: petmagix_navid_bot

/newbot
Bot Name: Neda Tehrani - Market Analyst
Username: petmagix_neda_bot
```

Save all 6 bot tokens!

## Step 2: Create Telegram Group

1. Create a new Telegram group
2. Add all 6 bots to the group
3. Make all bots administrators
4. Get the group chat ID:
   - Add [@userinfobot](https://t.me/userinfobot) to group
   - Send any message
   - Note the group ID (negative number)

## Step 3: Database Setup

### MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Create database user
4. Get connection string

### Redis Cloud (Free)
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create free database
3. Get connection URL

## Step 4: Deploy to Railway (Free)

1. Fork this repository
2. Connect to [Railway](https://railway.app)
3. Deploy from GitHub
4. Set environment variables:

```env
# Bot Tokens
COORDINATOR_BOT_TOKEN=your_coordinator_token
SARA_BOT_TOKEN=your_sara_token
AMIR_BOT_TOKEN=your_amir_token
LALEH_BOT_TOKEN=your_laleh_token
NAVID_BOT_TOKEN=your_navid_token
NEDA_BOT_TOKEN=your_neda_token

# OpenAI
OPENAI_API_KEY=your_openai_key

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/petmagix
REDIS_URL=redis://user:pass@host:port

# Telegram
GROUP_CHAT_ID=-1001234567890
CEO_USER_ID=your_telegram_user_id

# Server
PORT=3000
WEBHOOK_URL=https://your-app.railway.app
```

## Step 5: Test the System

1. Go to your Telegram group
2. Send: `/start`
3. Try: `@sara create a marketing plan`
4. Test: `Sara, what's our Instagram strategy?`

## Cost Optimization Tips

### OpenAI API Cost Reduction:
- Use GPT-5-nano for most interactions (cheapest)
- Cache responses for 1 hour
- Implement smart routing to avoid unnecessary calls
- Set monthly spending limits

### Free Infrastructure:
- **Railway**: 500 hours/month free
- **MongoDB Atlas**: 512MB free forever  
- **Redis Cloud**: 30MB free forever
- **GitHub Actions**: 2000 minutes/month free

### Expected Monthly Costs:
- OpenAI API: $10-30 (depending on usage)
- Infrastructure: $0 (free tiers)
- **Total: $10-30/month**

## Monitoring & Maintenance

### Health Checks:
- `/health` endpoint for uptime monitoring
- Automatic restarts on failures
- Error logging and alerts

### Usage Analytics:
```bash
# Check logs
railway logs

# Monitor costs
# OpenAI dashboard: https://platform.openai.com/usage
```

## Troubleshooting

### Common Issues:

1. **Bot not responding**
   - Check bot tokens
   - Verify group permissions
   - Check Railway logs

2. **Database connection failed**
   - Verify MongoDB/Redis URLs
   - Check IP whitelist settings

3. **OpenAI API errors**
   - Verify API key
   - Check rate limits
   - Monitor usage quotas

### Support Commands:
```
/status - Team status
/help - Available commands
```

## Security Best Practices

1. **Environment Variables**: Never commit tokens to git
2. **Rate Limiting**: Built-in protection against spam
3. **Access Control**: Only responds in designated group
4. **Error Handling**: Graceful failure without exposing internals

## Scaling Options

When you outgrow free tiers:
- **Railway Pro**: $5/month for more resources
- **MongoDB Atlas**: $9/month for dedicated cluster
- **Redis Cloud**: $5/month for more memory
- **OpenAI**: Volume discounts available

---

🎉 **Your PetMagix AI team is ready to help grow your business!**
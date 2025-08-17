# Production Webhook Setup Guide

## Problem
The Telegram polling conflict error occurs when multiple bot instances try to poll the same bot token simultaneously. This commonly happens in production environments like Render where services can restart or scale.

## Solution
Switch from polling mode to webhook mode in production to eliminate conflicts.

## Setup Instructions

### 1. Environment Variables on Render

Set these environment variables in your Render dashboard:

```bash
NODE_ENV=production
WEBHOOK_URL=https://your-app-name.onrender.com
```

### 2. Render Configuration

The `render.yaml` file is already configured to:
- Set `NODE_ENV=production` automatically
- Use the service URL as `WEBHOOK_URL`
- Enable health checks at `/health`

### 3. How It Works

**Development Mode (NODE_ENV != production):**
- Uses polling mode
- Coordinator bot polls for messages
- Other bots have polling disabled

**Production Mode (NODE_ENV = production):**
- Uses webhook mode
- Telegram sends messages directly to `/webhook/:botId` endpoints
- No polling conflicts

### 4. Webhook Endpoints

The following endpoints are automatically configured:
- `/webhook/coordinator`
- `/webhook/sara`
- `/webhook/amir`
- `/webhook/laleh`
- `/webhook/navid`
- `/webhook/neda`

### 5. Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add webhook support for production"
   git push origin main
   ```

2. **Deploy on Render:**
   - Connect your GitHub repository
   - Set environment variables
   - Deploy the service

3. **Verify Setup:**
   - Check `/health` endpoint shows `"mode": "webhook"`
   - Monitor logs for webhook setup messages
   - Test bot functionality

### 6. Troubleshooting

**If you still get polling errors:**
1. Check `NODE_ENV` is set to `production`
2. Verify `WEBHOOK_URL` is correctly set
3. Check Render logs for webhook setup messages
4. Ensure no other instances are running

**Health Check:**
Visit `https://your-app.onrender.com/health` to see:
```json
{
  "status": "healthy",
  "mode": "webhook",
  "bots": ["coordinator", "sara", "amir", "laleh", "navid", "neda"]
}
```

### 7. Benefits

- ✅ No more polling conflicts
- ✅ Better performance (instant message delivery)
- ✅ Lower server resource usage
- ✅ More reliable in production
- ✅ Scales better with multiple instances

## Emergency Fallback

If webhooks fail, you can temporarily switch back to polling by:
1. Setting `NODE_ENV=development` in Render
2. Redeploying the service

This will clear webhooks and enable polling mode.
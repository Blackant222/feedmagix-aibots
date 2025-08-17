# 🤖 PetMagix Autonomous AI Employees Setup Guide

## Overview

This guide will help you set up the enhanced PetMagix AI bot system where each bot acts as an autonomous employee with advanced capabilities including:

- 📄 **Google Docs Creation** - Bots can create and manage documents
- 🔍 **Web Search** - Real-time information gathering
- 🎨 **Image Generation** - AI-powered visual content creation
- 🤖 **Autonomous Behavior** - Proactive work and decision-making
- 👥 **Office-like Communication** - Team collaboration protocols
- 🚀 **Auto-deployment** - Seamless updates via Git push

## 🛠 Prerequisites

### 1. Google Cloud Platform Setup

#### A. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Docs API
   - Google Drive API
   - Google Custom Search API
   - Gemini API

#### B. Create Service Account
1. Navigate to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `petmagix-ai-bots`
4. Grant these roles:
   - Editor
   - Storage Admin
   - Service Account User
5. Create and download the JSON key file
6. Rename it to `google-credentials.json`

#### C. Get API Keys
1. **Google API Key**: Go to **APIs & Services** > **Credentials** > **Create Credentials** > **API Key**
2. **Gemini API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Custom Search Engine**: 
   - Go to [Google Custom Search](https://cse.google.com/)
   - Create a new search engine
   - Get the Search Engine ID

### 2. Environment Configuration

#### Copy and configure environment variables:
```bash
cp .env.example .env
```

#### Fill in the required values in `.env`:

```env
# Google Services
GOOGLE_API_KEY=your_actual_google_api_key
GEMINI_API_KEY=your_actual_gemini_api_key
GOOGLE_SERVICE_ACCOUNT_KEY=./google-credentials.json
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
GOOGLE_SEARCH_API_KEY=your_search_api_key

# Autonomous Behavior
AUTONOMOUS_MODE=true
WORK_START_HOUR=9
WORK_END_HOUR=18
PROACTIVE_INTERVAL=30

# Feature Flags
FEATURE_GOOGLE_DOCS=true
FEATURE_WEB_SEARCH=true
FEATURE_IMAGE_GENERATION=true
FEATURE_AUTONOMOUS_NOTIFICATIONS=true
```

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Place Google Credentials
```bash
# Place your google-credentials.json file in the project root
cp /path/to/your/google-credentials.json ./google-credentials.json
```

### 3. Test the Setup
```bash
# Development mode (with polling)
NODE_ENV=development npm start

# Production mode (with webhooks)
NODE_ENV=production npm start
```

## 🤖 Bot Capabilities

### Enhanced Commands

Each bot now supports these autonomous commands:

#### Document Management
```
/create_doc [title] - Create a Google Doc
Example: /create_doc Marketing Strategy Q1 2025
```

#### Web Search
```
/search [query] - Search the web
Example: /search pet food trends Iran 2025
```

#### Image Generation
```
/generate_image [description] - Generate AI images
Example: /generate_image cute Persian cat with PetMagix food
```

#### Autonomous Control
```
/autonomous on - Enable autonomous behavior
/autonomous off - Disable autonomous behavior
```

#### Team Status
```
/my_focus - Show current focus and goals
/team_status - Show team collaboration status
```

### Autonomous Behaviors

#### 🌅 Daily Briefings
- Each bot sends a morning briefing at 9 AM Tehran time
- Includes daily goals and current focus
- Team status updates

#### 🔄 Proactive Actions
Bots automatically perform these actions when idle for 2+ hours:

**Sara (Marketing Strategist):**
- Market research reports
- Competitor analysis
- Campaign performance reviews
- Social media content creation

**Amir (Creative Content Writer):**
- Content idea generation
- Blog post drafts
- Social media posts
- Creative campaign concepts

**Laleh (Data Analyst):**
- Performance metrics analysis
- Data insights reports
- Trend analysis
- KPI dashboards

**Navid (COO):**
- Operational efficiency reports
- Process optimization suggestions
- Team productivity analysis
- Resource allocation reviews

**Neda (Market Analyst):**
- Market trend analysis
- Customer behavior insights
- Competitive landscape reports
- Industry research summaries

## 🔄 Auto-Deployment Setup

### GitHub Actions Configuration

The system includes automatic deployment to Render when you push to Git.

#### 1. GitHub Secrets Setup
Add these secrets to your GitHub repository:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add these repository secrets:
   ```
   RENDER_SERVICE_ID=your_render_service_id
   RENDER_API_KEY=your_render_api_key
   ```

#### 2. Get Render Credentials
1. **Service ID**: Found in your Render service URL
   ```
   https://dashboard.render.com/web/srv-xxxxxxxxx
                                    ^^^^^^^^^^^^ This is your service ID
   ```

2. **API Key**: 
   - Go to Render Dashboard > Account Settings
   - Generate a new API Key
   - Copy and add to GitHub secrets

#### 3. Deployment Workflow
The deployment automatically triggers on:
- Push to `main` branch (production)
- Push to `develop` branch (staging)

### Manual Deployment
If auto-deployment is not set up:
```bash
# Commit your changes
git add .
git commit -m "feat: enhanced autonomous bot capabilities"
git push origin develop

# Then manually deploy on Render dashboard
```

## 🏢 Office-like Communication Protocols

### Team Interaction Rules

1. **Morning Check-ins**: All bots send status at 9 AM
2. **Cross-bot Collaboration**: Bots can request help from teammates
3. **Autonomous Reporting**: Proactive updates on completed tasks
4. **Document Sharing**: Automatic sharing of created documents
5. **Research Collaboration**: Shared research and insights

### Communication Examples

```
🤖 Sara: "📊 Created market research report: [Google Doc Link]"
🤖 Amir: "✍️ Based on Sara's research, I'll create content for the new campaign"
🤖 Laleh: "📈 Analyzing the data from Sara's report, here are key insights..."
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Google Services Not Working
```bash
# Check if credentials file exists
ls -la google-credentials.json

# Verify API keys in .env
grep GOOGLE .env

# Check logs for initialization errors
tail -f logs/app.log
```

#### 2. Autonomous Behavior Not Active
```bash
# Check if autonomous mode is enabled
grep AUTONOMOUS_MODE .env

# Verify working hours
grep WORK_ .env

# Check bot logs
grep "autonomous" logs/app.log
```

#### 3. Auto-deployment Failing
```bash
# Check GitHub Actions logs
# Go to GitHub > Actions tab > View failed workflow

# Verify Render secrets
echo $RENDER_SERVICE_ID
echo $RENDER_API_KEY
```

### Debug Commands

```bash
# Test Google services
node -e "const GoogleServices = require('./services/google-services'); const gs = new GoogleServices(); gs.initialize().then(() => console.log('✅ Google services working')).catch(console.error);"

# Test autonomous behavior
node -e "const AutonomousBehavior = require('./services/autonomous-behavior'); const ab = new AutonomousBehavior('test', {}); console.log('✅ Autonomous behavior loaded');"

# Check environment variables
node -e "console.log('Environment check:', { google: !!process.env.GOOGLE_API_KEY, autonomous: process.env.AUTONOMOUS_MODE, features: { docs: process.env.FEATURE_GOOGLE_DOCS, search: process.env.FEATURE_WEB_SEARCH } });"
```

## 📊 Monitoring & Analytics

### Performance Metrics
- Document creation count
- Search queries performed
- Autonomous actions taken
- Team collaboration frequency
- Response time and accuracy

### Logs Location
```
logs/
├── app.log              # General application logs
├── autonomous.log       # Autonomous behavior logs
├── google-services.log  # Google API interactions
└── team-communication.log # Cross-bot communications
```

## 🎯 Next Steps

1. **Monitor Bot Performance**: Check logs and autonomous actions
2. **Customize Behaviors**: Modify autonomous actions per bot role
3. **Expand Capabilities**: Add more Google services (Calendar, Gmail, etc.)
4. **Team Training**: Familiarize team with new bot commands
5. **Performance Optimization**: Fine-tune autonomous intervals and triggers

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in the `logs/` directory
3. Test individual components using debug commands
4. Verify all environment variables are correctly set

---

**🎉 Congratulations!** Your PetMagix AI team is now a fully autonomous workforce ready to boost productivity and collaboration!

*Last updated: January 2025*
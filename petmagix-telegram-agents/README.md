# 🐾 PetMagix Telegram AI Agents

A sophisticated multi-agent AI system for PetMagix, featuring 6 specialized AI employees working together in a Telegram group to grow your pet care business.

## 🎯 System Overview

This system creates a virtual team of AI agents, each with unique personalities, expertise, and tools, all working together in a Telegram group chat to support PetMagix's growth and FeedMagix launch.

### Team Members

| Agent | Role | Personality | Primary Tools |
|-------|------|-------------|---------------|
| 🎯 **Sara Mehr** | Marketing Strategist | Creative, strategic growth wizard | GPT-5-nano, GPT-4o-search, GPT-image |
| ✍️ **Amir Kaviani** | Creative Copywriter | Pet-loving storyteller | GPT-5-nano, GPT-image, GPT-TTS |
| 📊 **Laleh Shadmehr** | Analytics Specialist | Numbers whisperer | GPT-5-nano, GPT-4o-search, Computer-use |
| ⚙️ **Navid Ramin** | COO | Operations driver | GPT-5-nano, Computer-use |
| 🔍 **Neda Tehrani** | Market Analyst | Pet industry scout | GPT-4o-search, GPT-5-nano |
| 🤖 **Coordinator** | System Router | Task coordinator & context keeper | All tools |

## 🚀 Quick Start

### 1. Prerequisites
- 6 Telegram bot tokens (create via [@BotFather](https://t.me/botfather))
- OpenAI API key with model access
- MongoDB Atlas free account
- Redis Cloud free account
- Railway/Render deployment account

### 2. Environment Setup
```bash
cp .env.example .env
# Fill in your tokens and credentials
```

### 3. Deploy to Railway
```bash
# Connect your GitHub repo to Railway
# Set environment variables in Railway dashboard
# Deploy automatically triggers
```

### 4. Add Bots to Telegram Group
1. Create Telegram group
2. Add all 6 bots as administrators
3. Send `/start` to activate the team

## 💬 Usage Examples

### Direct Task Assignment
```
@sara create Instagram campaign for FeedMagix launch
@amir write emotional copy for pet food safety
@laleh analyze our conversion funnel performance
@navid plan next sprint for micro-SaaS expansion
@neda research premium pet food trends in Tehran
```

### Natural Conversation
```
Sara, what's our best strategy for reaching Persian pet owners?
Amir, can you help with landing page copy that converts?
Laleh, how are our Instagram metrics performing?
```

### Team Commands
```
/status - View team workload and active tasks
/help - See available commands and usage examples
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Telegram Group │────│  Coordinator Bot │────│   Agent Bots    │
│   (CEO + Bots)  │    │   (Routes msgs)  │    │ (Sara/Amir/etc) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                ┌──────▼──────┐   ┌──────▼──────┐
                │ Memory Layer│   │ AI Services │
                │Redis+MongoDB│   │   OpenAI    │
                └─────────────┘   └─────────────┘
```

## 🧠 Intelligence Features

### Context Awareness
- **Short-term memory**: 24-hour conversation context (Redis)
- **Long-term memory**: Persistent knowledge base (MongoDB)
- **Task continuity**: Agents remember ongoing projects
- **Team collaboration**: Agents reference each other's work

### Smart Routing
- **Command parsing**: `@agent task` format recognition
- **Natural mentions**: "Sara, help with marketing" detection
- **Content analysis**: Auto-route based on message content
- **Fallback handling**: Coordinator manages unclear requests

### Cost Optimization
- **Model selection**: Right AI model for each task
- **Context caching**: Reduce redundant API calls
- **Rate limiting**: Prevent API abuse
- **Batch processing**: Efficient request handling

## 🌍 Deployment Options

### Free Tier (Recommended for MVP)
- **Railway**: 500 hours/month free
- **MongoDB Atlas**: 512MB free forever
- **Redis Cloud**: 30MB free forever
- **Expected cost**: $10-30/month (OpenAI API only)

### Production Scale
- **Railway Pro**: $5/month for dedicated resources
- **MongoDB Atlas M10**: $9/month for production cluster
- **Redis Cloud**: $5/month for enhanced memory
- **OpenAI**: Volume discounts available

## 📊 Monitoring & Analytics

### Health Monitoring
```bash
# Check system health
curl https://your-app.railway.app/health

# View logs
railway logs --tail

# Monitor OpenAI usage
# Visit: https://platform.openai.com/usage
```

### Performance Metrics
- Response time per agent
- API call efficiency
- Memory usage patterns
- Task completion rates
- User engagement levels

## 🔧 Configuration

### Agent Customization
Edit `src/config/agents.js` to modify:
- Agent personalities
- Tool assignments
- Language preferences
- Specialization areas
- Greeting messages

### Memory Settings
Adjust in `src/services/memory.js`:
- Cache TTL values
- Rate limiting thresholds
- Context retention periods
- Database collection names

### AI Model Selection
Configure in `src/services/ai.js`:
- Primary model per agent
- Fallback strategies
- Temperature settings
- Token limits

## 🛡️ Security & Best Practices

### Security Features
- **Environment isolation**: No secrets in code
- **Rate limiting**: Prevent API abuse
- **Access control**: Group-only responses
- **Error handling**: No internal data exposure
- **Graceful degradation**: Fallback responses

### Cost Management
- **Smart caching**: Reduce redundant calls
- **Model optimization**: Use cheapest suitable model
- **Request batching**: Efficient API usage
- **Usage monitoring**: Track and alert on limits

## 🚨 Troubleshooting

### Common Issues

**Bots not responding**
```bash
# Check bot tokens
echo $SARA_BOT_TOKEN

# Verify group permissions
# Ensure bots are administrators

# Check Railway logs
railway logs
```

**Database connection failed**
```bash
# Test MongoDB connection
mongosh $MONGODB_URI

# Test Redis connection
redis-cli -u $REDIS_URL ping
```

**OpenAI API errors**
```bash
# Check API key validity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Monitor usage
# Visit: https://platform.openai.com/usage
```

### Support Commands
```
/status - Team status and active tasks
/help - Available commands and examples
```

## 📈 Scaling Strategy

### Phase 1: MVP (Current)
- 6 AI agents with core functionality
- Free tier infrastructure
- Basic memory and routing
- Essential PetMagix context

### Phase 2: Growth
- Enhanced agent capabilities
- Advanced analytics and reporting
- Custom integrations (Instagram, etc.)
- Expanded knowledge base

### Phase 3: Enterprise
- Multi-language support expansion
- Advanced workflow automation
- Custom agent training
- Enterprise security features

## 🤝 Contributing

### Development Setup
```bash
git clone <repository>
cd petmagix-telegram-agents
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Adding New Agents
1. Define agent in `src/config/agents.js`
2. Create bot token via @BotFather
3. Add token to environment variables
4. Update coordinator routing logic
5. Test in development group

### Extending Capabilities
- Add new AI models in `src/services/ai.js`
- Implement custom tools and integrations
- Enhance memory and context handling
- Create specialized workflows

## 📄 License

MIT License - Feel free to adapt for your own projects!

## 🎉 Ready to Launch!

Your PetMagix AI team is ready to help grow your business. Add the bots to your Telegram group and start collaborating with your virtual employees!

**Next Steps:**
1. Complete the setup guide
2. Test each agent's capabilities
3. Start with simple tasks
4. Gradually increase complexity
5. Monitor performance and costs
6. Scale based on success metrics

---

*Built with ❤️ for PetMagix - The future of pet care is here!* 🐾
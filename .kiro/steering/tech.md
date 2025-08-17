# Technology Stack & Development Guidelines

## Core Technologies
- **Runtime**: Node.js (>=18.0.0)
- **Language**: JavaScript (CommonJS modules)
- **Framework**: Express.js for web server
- **Bot Framework**: node-telegram-bot-api
- **AI Integration**: OpenAI API (multiple models)

## Dependencies
### Production
- `node-telegram-bot-api`: Telegram bot integration
- `openai`: AI service integration
- `redis`: Short-term memory/caching
- `mongodb`: Persistent data storage
- `express`: Web server framework
- `dotenv`: Environment configuration
- `axios`: HTTP client
- `uuid`: Unique ID generation
- `moment`: Date/time handling

### Development
- `nodemon`: Development auto-reload

## AI Models Used
- **Primary**: `gpt-5-nano-2025-08-07`
- **Search**: `gpt-4o-search-preview-2025-03-11`
- **Images**: `gpt-image-1`
- **Audio**: `gpt-4o-mini-tts`, `gpt-4o-audio-preview`
- **Automation**: `computer-use-preview-2025-03-11`

## Infrastructure
- **Deployment**: Railway (free tier)
- **Database**: MongoDB Atlas (free tier)
- **Cache**: Redis Cloud (free tier)
- **CI/CD**: GitHub Actions

## Common Commands
```bash
# Development
npm run dev          # Start with nodemon
npm start           # Production start
npm run deploy      # Deploy to Railway

# Environment setup
cp .env.example .env # Copy environment template
```

## Architecture Patterns
- **Multi-agent system**: Each team member is a separate bot instance
- **Service-oriented**: Separate services for AI, memory, and coordination
- **Event-driven**: Message routing through coordinator service
- **Stateful**: Conversation context and task tracking
- **Rate-limited**: Built-in rate limiting per user

## Code Style
- CommonJS module system (`require`/`module.exports`)
- Async/await for asynchronous operations
- Error handling with try/catch blocks
- Environment-based configuration
- Graceful shutdown handling
- Comprehensive logging with emojis for readability
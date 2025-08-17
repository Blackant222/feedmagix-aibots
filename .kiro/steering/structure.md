# Project Structure & Organization

## Directory Layout
```
petmagix-telegram-agents/
├── src/
│   ├── index.js              # Application entry point
│   ├── bot.js                # Main bot system orchestrator
│   ├── config/
│   │   └── agents.js         # Agent definitions and company context
│   └── services/
│       ├── ai.js             # OpenAI integration service
│       ├── memory.js         # Redis/MongoDB memory management
│       └── coordinator.js    # Message routing and task coordination
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
└── railway.json              # Deployment configuration
```

## Key Components

### Entry Point (`src/index.js`)
- Environment validation
- Express server setup
- Bot system initialization
- Health check endpoint (`/health`)
- Graceful shutdown handling

### Bot System (`src/bot.js`)
- Multi-bot management (one per agent)
- Message handler setup
- Startup/shutdown coordination
- Command processing (`/start`, `/status`, `/help`)

### Configuration (`src/config/agents.js`)
- Agent personality definitions
- Tool assignments per agent
- Company context constants
- Bilingual greeting messages

### Services Architecture
- **AI Service**: OpenAI model interactions, prompt building, fallback responses
- **Memory Service**: Redis (short-term) + MongoDB (persistent) storage
- **Coordinator Service**: Message routing, task management, context handling

## Agent System Design
Each agent has:
- Unique personality and role
- Specific AI model assignments
- Tool access permissions
- Language preferences
- Specialized capabilities

## Data Flow
1. Message received in Telegram group
2. Coordinator parses and routes message
3. Appropriate agent processes with AI service
4. Response generated and sent back
5. Context saved to memory services

## Environment Configuration
Required variables:
- Bot tokens for each agent
- OpenAI API key
- Database connection strings
- Telegram group/user IDs
- Server configuration

## Naming Conventions
- **Files**: kebab-case (`coordinator.js`)
- **Classes**: PascalCase (`AIService`)
- **Variables**: camelCase (`agentId`)
- **Constants**: UPPER_SNAKE_CASE (`COMPANY_CONTEXT`)
- **Agent IDs**: lowercase (`sara`, `amir`)

## Error Handling Patterns
- Try/catch blocks for async operations
- Fallback responses for AI failures
- Graceful degradation for service outages
- Rate limiting for abuse prevention
- Comprehensive logging for debugging
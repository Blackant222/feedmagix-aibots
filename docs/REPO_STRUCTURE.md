# Repository Structure & Architecture

## Overview
This document defines the organizational structure of the ATOM (Autonomous Task-Oriented Multi-Agent Office) system, ensuring scalable, maintainable, and logical code organization.

## Project Root Structure

```
feedmagix-connect/
├── README.md                    # Project overview and setup instructions
├── package.json                 # Node.js dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore patterns
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── jest.config.js              # Jest testing configuration
├── docker-compose.yml          # Docker services configuration
├── Dockerfile                  # Container build instructions
│
├── docs/                       # Documentation
│   ├── CODE_CONVENTIONS.md     # Development standards
│   ├── REPO_STRUCTURE.md       # This file
│   ├── DEPLOYMENT_PIPELINE.md  # CI/CD documentation
│   ├── PERFORMANCE_GUIDELINES.md # Performance standards
│   ├── API_REFERENCE.md        # API documentation
│   └── ARCHITECTURE.md         # System architecture overview
│
├── src/                        # Source code
│   ├── index.js               # Application entry point
│   ├── config/                # Configuration management
│   ├── services/              # Core business logic services
│   ├── bots/                  # Telegram bot implementations
│   ├── models/                # Data models and schemas
│   ├── utils/                 # Utility functions and helpers
│   ├── middleware/            # Express/Bot middleware
│   └── constants/             # Application constants
│
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── e2e/                   # End-to-end tests
│   ├── fixtures/              # Test data and fixtures
│   └── helpers/               # Test utility functions
│
├── scripts/                   # Build and deployment scripts
│   ├── build.sh              # Build script
│   ├── deploy.sh              # Deployment script
│   ├── setup.sh               # Environment setup
│   └── migrate.js             # Database migration
│
├── data/                      # Data storage
│   ├── memory/                # ATOM memory storage
│   ├── tasks/                 # Task persistence
│   ├── logs/                  # Application logs
│   └── backups/               # Data backups
│
└── .github/                   # GitHub workflows and templates
    ├── workflows/             # CI/CD workflows
    ├── ISSUE_TEMPLATE/        # Issue templates
    └── PULL_REQUEST_TEMPLATE.md # PR template
```

## Core Modules Breakdown

### `/src/services/` - Business Logic Layer

```
services/
├── atom/                      # ATOM system core
│   ├── atom-task-manager.js   # Task lifecycle management
│   ├── atom-communication.js  # Agent-to-agent communication
│   ├── atom-memory.js         # Persistent memory system
│   ├── atom-coordinator.js    # Central coordination logic
│   └── atom-analytics.js      # Performance and usage analytics
│
├── ai/                        # AI service integrations
│   ├── openai.js             # OpenAI API integration
│   ├── google-ai.js          # Google AI (Gemini) integration
│   ├── model-router.js       # AI model selection logic
│   └── prompt-templates.js   # Reusable prompt templates
│
├── communication/             # External communication
│   ├── telegram.js           # Telegram Bot API wrapper
│   ├── webhook-handler.js     # Webhook processing
│   └── notification.js       # Notification system
│
├── data/                      # Data management
│   ├── storage.js            # File system operations
│   ├── cache.js              # In-memory caching
│   ├── backup.js             # Data backup/restore
│   └── migration.js          # Data migration utilities
│
└── security/                  # Security services
    ├── auth.js               # Authentication logic
    ├── encryption.js         # Data encryption/decryption
    └── rate-limiter.js       # Rate limiting implementation
```

**Why this structure?**
- **Separation of Concerns**: Each service has a single responsibility
- **ATOM Integration**: Dedicated ATOM module for autonomous operations
- **AI Abstraction**: Centralized AI service management
- **Scalability**: Easy to add new services without affecting existing ones

### `/src/bots/` - Bot Implementation Layer

```
bots/
├── coordinator.js             # Main coordinator bot
├── agents/                    # Individual agent implementations
│   ├── sara.js               # Sara - UI/UX Designer agent
│   ├── amir.js               # Amir - Backend Developer agent
│   ├── laleh.js              # Laleh - Frontend Developer agent
│   ├── navid.js              # Navid - Data Analyst agent
│   └── neda.js               # Neda - QA Engineer agent
│
├── base/                      # Base bot classes
│   ├── base-bot.js           # Abstract bot implementation
│   ├── agent-bot.js          # Base agent bot class
│   └── coordinator-bot.js    # Base coordinator class
│
└── handlers/                  # Message and event handlers
    ├── message-handler.js     # Text message processing
    ├── command-handler.js     # Bot command processing
    ├── callback-handler.js    # Inline keyboard callbacks
    └── error-handler.js       # Error handling and recovery
```

**Why this structure?**
- **Agent Specialization**: Each agent has dedicated implementation
- **Inheritance**: Base classes provide common functionality
- **Handler Separation**: Different message types handled separately
- **Maintainability**: Easy to modify individual agent behavior

### `/src/models/` - Data Models

```
models/
├── atom/                      # ATOM-specific models
│   ├── Task.js               # Task data model
│   ├── Agent.js              # Agent profile model
│   ├── Conversation.js       # Communication model
│   ├── Memory.js             # Memory interaction model
│   └── Decision.js           # Decision tracking model
│
├── telegram/                  # Telegram-specific models
│   ├── Message.js            # Telegram message model
│   ├── User.js               # Telegram user model
│   └── Chat.js               # Telegram chat model
│
├── ai/                        # AI-related models
│   ├── Prompt.js             # AI prompt model
│   ├── Response.js           # AI response model
│   └── Context.js            # AI context model
│
└── base/                      # Base model classes
    ├── BaseModel.js          # Abstract base model
    ├── Validator.js          # Data validation utilities
    └── Serializer.js         # Data serialization helpers
```

**Why this structure?**
- **Type Safety**: Clear data structure definitions
- **Validation**: Built-in data validation
- **Serialization**: Consistent data transformation
- **Documentation**: Models serve as living documentation

### `/src/config/` - Configuration Management

```
config/
├── index.js                   # Main configuration loader
├── environments/              # Environment-specific configs
│   ├── development.js        # Development settings
│   ├── staging.js            # Staging settings
│   ├── production.js         # Production settings
│   └── test.js               # Test environment settings
│
├── agents/                    # Agent-specific configurations
│   ├── sara.json             # Sara's skills and preferences
│   ├── amir.json             # Amir's skills and preferences
│   ├── laleh.json            # Laleh's skills and preferences
│   ├── navid.json            # Navid's skills and preferences
│   └── neda.json             # Neda's skills and preferences
│
├── ai-models.js              # AI model configurations
├── telegram.js               # Telegram bot settings
├── database.js               # Database connection settings
└── security.js               # Security and encryption settings
```

**Why this structure?**
- **Environment Separation**: Different configs for different environments
- **Agent Customization**: Individual agent personality and skill configs
- **Centralized Management**: All configuration in one place
- **Type Safety**: Configuration validation and type checking

### `/src/utils/` - Utility Functions

```
utils/
├── logger.js                  # Logging utilities
├── crypto.js                  # Cryptographic functions
├── date.js                    # Date/time utilities
├── string.js                  # String manipulation helpers
├── array.js                   # Array processing utilities
├── object.js                  # Object manipulation helpers
├── validation.js              # Input validation functions
├── error.js                   # Error handling utilities
├── performance.js             # Performance monitoring
└── constants.js               # Application-wide constants
```

**Why this structure?**
- **Reusability**: Common functions available across the application
- **Consistency**: Standardized utility implementations
- **Testing**: Easy to unit test utility functions
- **Performance**: Optimized common operations

## Data Storage Structure

### `/data/memory/` - ATOM Memory Storage

```
data/memory/
├── agents/                    # Agent-specific memory
│   ├── sara/
│   │   ├── interactions.json  # Interaction history
│   │   ├── tasks.json        # Task memories
│   │   ├── decisions.json    # Decision history
│   │   └── profile.json      # Agent profile data
│   ├── amir/
│   ├── laleh/
│   ├── navid/
│   └── neda/
│
├── conversations/             # Conversation logs
│   ├── 2024-01/              # Monthly organization
│   ├── 2024-02/
│   └── active/               # Currently active conversations
│
├── tasks/                     # Task-related memory
│   ├── active/               # Active task data
│   ├── completed/            # Completed task archives
│   └── templates/            # Task templates
│
└── system/                    # System-level memory
    ├── performance.json      # Performance metrics
    ├── analytics.json        # Usage analytics
    └── health.json           # System health data
```

**Why this structure?**
- **Agent Isolation**: Each agent has dedicated memory space
- **Temporal Organization**: Time-based organization for easy retrieval
- **Performance**: Separate active and archived data for speed
- **Backup**: Clear structure for backup and restore operations

## Testing Structure

### `/tests/` - Comprehensive Testing

```
tests/
├── unit/                      # Unit tests
│   ├── services/             # Service layer tests
│   │   ├── atom/
│   │   ├── ai/
│   │   └── communication/
│   ├── bots/                 # Bot implementation tests
│   ├── models/               # Data model tests
│   └── utils/                # Utility function tests
│
├── integration/               # Integration tests
│   ├── atom-workflow.test.js # End-to-end ATOM workflows
│   ├── ai-integration.test.js # AI service integration
│   └── telegram-bot.test.js  # Telegram bot integration
│
├── e2e/                       # End-to-end tests
│   ├── user-scenarios/       # Real user interaction scenarios
│   ├── agent-collaboration/  # Multi-agent collaboration tests
│   └── performance/          # Performance and load tests
│
├── fixtures/                  # Test data
│   ├── messages.json         # Sample Telegram messages
│   ├── tasks.json            # Sample task data
│   ├── agents.json           # Sample agent profiles
│   └── conversations.json    # Sample conversation data
│
└── helpers/                   # Test utilities
    ├── mock-telegram.js      # Telegram API mocking
    ├── mock-ai.js            # AI service mocking
    ├── test-data.js          # Test data generators
    └── assertions.js         # Custom test assertions
```

**Why this structure?**
- **Test Types**: Clear separation of unit, integration, and e2e tests
- **Parallel Structure**: Tests mirror the source code structure
- **Reusable Fixtures**: Shared test data across test suites
- **Mocking**: Isolated testing with proper mocking utilities

## Module Dependencies

### Dependency Flow
```
Bots Layer (coordinator.js, agents/)
    ↓
Services Layer (atom/, ai/, communication/)
    ↓
Models Layer (Task.js, Agent.js, etc.)
    ↓
Utils Layer (logger.js, validation.js, etc.)
```

### Import Rules
1. **No Circular Dependencies**: Higher layers cannot import from lower layers
2. **Service Isolation**: Services should not directly import from each other
3. **Utility Access**: All layers can import from utils
4. **Model Access**: All layers can import models
5. **Configuration Access**: All layers can import from config

## Scalability Considerations

### Horizontal Scaling
- **Microservice Ready**: Each service can be extracted to separate microservice
- **Agent Distribution**: Agents can run on separate processes/containers
- **Memory Sharding**: Memory can be distributed across multiple storage systems
- **Load Balancing**: Multiple coordinator instances can handle different chat groups

### Vertical Scaling
- **Caching Layers**: Redis integration for high-performance caching
- **Database Integration**: PostgreSQL/MongoDB for persistent storage
- **Queue Systems**: Bull/Agenda for background job processing
- **Monitoring**: Prometheus/Grafana for system monitoring

## Future Extensions

### Planned Additions
```
src/
├── plugins/                   # Plugin system for extensions
│   ├── slack-integration/    # Slack bot integration
│   ├── discord-integration/  # Discord bot integration
│   └── web-interface/        # Web dashboard
│
├── analytics/                 # Advanced analytics
│   ├── performance-monitor/  # Real-time performance monitoring
│   ├── usage-tracker/        # Usage analytics and insights
│   └── ml-insights/          # Machine learning insights
│
└── integrations/              # External service integrations
    ├── github/               # GitHub integration
    ├── jira/                 # Jira integration
    └── calendar/             # Calendar integration
```

### Migration Strategy
- **Backward Compatibility**: All changes maintain backward compatibility
- **Gradual Migration**: New features added without breaking existing functionality
- **Data Migration**: Automated scripts for data structure changes
- **Version Management**: Semantic versioning for all components

## Development Workflow

### Feature Development
1. Create feature branch from `develop`
2. Implement in appropriate module following structure
3. Add comprehensive tests
4. Update documentation
5. Create pull request with proper review
6. Merge to `develop` after approval
7. Deploy to staging for testing
8. Merge to `main` for production deployment

### Code Organization Best Practices
- **Single Responsibility**: Each file/class has one clear purpose
- **Loose Coupling**: Minimal dependencies between modules
- **High Cohesion**: Related functionality grouped together
- **Clear Interfaces**: Well-defined APIs between layers
- **Documentation**: Comprehensive documentation for all public APIs

This structure ensures the ATOM system remains maintainable, scalable, and easy to understand as it grows in complexity and functionality.
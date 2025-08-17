# Code Conventions & Standards

## Overview
This document establishes coding standards, formatting rules, and development practices for the ATOM (Autonomous Task-Oriented Multi-Agent Office) system.

## Language & Framework Standards

### JavaScript/Node.js
- **ES6+ Features**: Use modern JavaScript features (async/await, destructuring, arrow functions)
- **Module System**: Use ES6 imports/exports where possible, CommonJS for Node.js compatibility
- **Async Patterns**: Prefer async/await over Promises and callbacks

### Code Style & Formatting

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

#### ESLint Rules
```json
{
  "extends": ["eslint:recommended", "node"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": "error",
    "curly": "error"
  }
}
```

## Naming Conventions

### Files & Directories
- **Files**: kebab-case (`atom-task-manager.js`, `google-ai.js`)
- **Directories**: kebab-case (`services/`, `bots/`, `docs/`)
- **Classes**: PascalCase (`ATOMTaskManager`, `CoordinatorBot`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`, `DEFAULT_PRIORITY`)

### Variables & Functions
- **Variables**: camelCase (`taskManager`, `agentId`, `conversationId`)
- **Functions**: camelCase (`createTask`, `initiateConversation`, `recordInteraction`)
- **Private Methods**: prefix with underscore (`_validateTask`, `_generateId`)
- **Event Handlers**: prefix with `handle` (`handleTaskCreated`, `handleCEOApproval`)

### ATOM-Specific Conventions
- **Agent IDs**: lowercase (`sara`, `amir`, `laleh`, `navid`, `neda`)
- **Task IDs**: UUID format (`task_${uuid}`)
- **Conversation IDs**: descriptive format (`conv_${agentA}_${agentB}_${timestamp}`)
- **Memory Keys**: dot notation (`agent.sara.interactions`, `task.12345.history`)

## Code Organization

### Class Structure
```javascript
class ATOMComponent {
  // 1. Constructor
  constructor(options = {}) {
    this.validateOptions(options);
    this.initializeProperties(options);
    this.setupEventListeners();
  }

  // 2. Public Methods (alphabetical)
  async createTask(taskData) {
    // Implementation
  }

  async deleteTask(taskId) {
    // Implementation
  }

  // 3. Private Methods (alphabetical)
  _generateTaskId() {
    // Implementation
  }

  _validateTaskData(data) {
    // Implementation
  }

  // 4. Event Handlers
  handleTaskCreated(task) {
    // Implementation
  }

  // 5. Getters/Setters
  get activeTasks() {
    return this._tasks.filter(t => t.status !== 'completed');
  }
}
```

### Error Handling
```javascript
// Always use try-catch for async operations
try {
  const result = await this.performOperation();
  return result;
} catch (error) {
  console.error(`Error in ${this.constructor.name}.performOperation:`, error);
  throw new Error(`Operation failed: ${error.message}`);
}

// Use specific error types
class ATOMError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'ATOMError';
    this.code = code;
    this.context = context;
  }
}
```

## Git Workflow

### Conventional Commits
Use the following format for commit messages:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples
```bash
feat(atom): implement autonomous task assignment
fix(coordinator): resolve repetitive response issue
docs(readme): update ATOM architecture documentation
refactor(memory): optimize agent interaction storage
```

### Branch Naming
- **Feature branches**: `feature/atom-task-manager`
- **Bug fixes**: `fix/coordinator-routing-issue`
- **Documentation**: `docs/code-conventions`
- **Refactoring**: `refactor/memory-optimization`

### Git Hooks
```bash
# Pre-commit hook
#!/bin/sh
npm run lint
npm run test
```

## Documentation Standards

### JSDoc Comments
```javascript
/**
 * Creates a new task and assigns it to the best available agent
 * @param {Object} taskData - Task configuration object
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Detailed task description
 * @param {string} taskData.priority - Task priority (low|medium|high|urgent)
 * @param {string[]} taskData.requiredSkills - Required skills for task completion
 * @param {boolean} taskData.requiresCEOApproval - Whether CEO approval is needed
 * @returns {Promise<Object>} Created task object with assigned agent
 * @throws {ATOMError} When task creation fails
 * @example
 * const task = await taskManager.createTask({
 *   title: 'Design new UI component',
 *   description: 'Create responsive navigation component',
 *   priority: 'high',
 *   requiredSkills: ['ui_design', 'frontend'],
 *   requiresCEOApproval: false
 * });
 */
async createTask(taskData) {
  // Implementation
}
```

### README Structure
```markdown
# Component Name

## Overview
Brief description of the component's purpose

## Installation
How to install/setup the component

## Usage
Basic usage examples

## API Reference
Detailed API documentation

## Examples
Comprehensive examples

## Contributing
Contribution guidelines
```

## Testing Standards

### Test Structure
```javascript
describe('ATOMTaskManager', () => {
  let taskManager;

  beforeEach(() => {
    taskManager = new ATOMTaskManager();
  });

  describe('createTask', () => {
    it('should create task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium'
      };

      const task = await taskManager.createTask(taskData);

      expect(task).toHaveProperty('id');
      expect(task.title).toBe(taskData.title);
      expect(task.status).toBe('pending');
    });

    it('should throw error with invalid data', async () => {
      await expect(taskManager.createTask({})).rejects.toThrow(ATOMError);
    });
  });
});
```

### Test Coverage Requirements
- **Minimum Coverage**: 80% for all ATOM components
- **Critical Paths**: 95% coverage for task management and agent communication
- **Integration Tests**: Required for all inter-component interactions

## Performance Standards

### Response Time Requirements
- **Task Creation**: < 100ms
- **Agent Assignment**: < 200ms
- **Memory Operations**: < 50ms
- **Communication Initiation**: < 150ms

### Memory Management
```javascript
// Clean up resources in destructors
class ATOMComponent {
  destroy() {
    this.removeAllListeners();
    this.clearTimers();
    this.closeConnections();
  }
}

// Use WeakMap for private data
const privateData = new WeakMap();

class ATOMComponent {
  constructor() {
    privateData.set(this, {
      internalState: {},
      timers: []
    });
  }
}
```

## Security Guidelines

### Input Validation
```javascript
// Always validate input data
function validateTaskData(data) {
  const schema = {
    title: { type: 'string', required: true, maxLength: 100 },
    description: { type: 'string', required: true, maxLength: 1000 },
    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] }
  };

  return validate(data, schema);
}
```

### Environment Variables
```javascript
// Never commit secrets
const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  googleApiKey: process.env.GOOGLE_API_KEY,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN
};

// Validate required environment variables
function validateEnvironment() {
  const required = ['OPENAI_API_KEY', 'GOOGLE_API_KEY', 'TELEGRAM_BOT_TOKEN'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

## ATOM-Specific Guidelines

### Agent Communication
```javascript
// Always use the ATOM Communication system for agent interactions
const conversationId = await this.atomCommunication.initiateConversation(
  'sara',
  'amir',
  'task_collaboration',
  { taskId: 'task_123', priority: 'high' }
);
```

### Memory Management
```javascript
// Record all significant interactions
await this.atomMemory.recordInteraction('sara', {
  type: 'task_completion',
  context: { taskId: 'task_123', result: 'success' },
  participants: ['sara', 'coordinator'],
  outcome: { completed: true, quality: 0.9 },
  duration: 1800000, // 30 minutes
  quality: 0.9
});
```

### Task Lifecycle
```javascript
// Follow the complete task lifecycle
const task = this.atomTaskManager.createTask(taskData);
// Task automatically assigned to best agent
// Agent works on task autonomously
// Progress tracked in memory
// CEO approval requested if needed
// Task completed and recorded
```

## Code Review Checklist

- [ ] Follows naming conventions
- [ ] Includes proper error handling
- [ ] Has comprehensive JSDoc comments
- [ ] Includes unit tests with >80% coverage
- [ ] Follows ATOM communication patterns
- [ ] Records interactions in memory
- [ ] Validates input data
- [ ] No hardcoded secrets or credentials
- [ ] Proper async/await usage
- [ ] Clean, readable code structure

## Tools & Setup

### Required Tools
```bash
# Install development dependencies
npm install --save-dev eslint prettier jest

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.autoFixOnSave": true,
  "files.associations": {
    "*.js": "javascript"
  }
}
```

This document ensures consistent, maintainable, and high-quality code across the entire ATOM system.
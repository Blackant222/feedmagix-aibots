const { AGENTS } = require('../config/agents');

class CoordinatorService {
  constructor(memoryService, aiService) {
    this.memory = memoryService;
    this.ai = aiService;
  }

  async routeMessage(message, fromUser, chatId) {
    // Check if message is a direct command
    const command = this.parseCommand(message);
    
    if (command) {
      return await this.handleCommand(command, fromUser, chatId);
    }

    // Check if message mentions specific agent
    const mentionedAgent = this.findMentionedAgent(message);
    
    if (mentionedAgent) {
      return await this.routeToAgent(mentionedAgent, message, fromUser, chatId);
    }

    // Auto-route based on content analysis
    const suggestedAgent = await this.analyzeAndRoute(message, chatId);
    
    if (suggestedAgent) {
      return await this.routeToAgent(suggestedAgent, message, fromUser, chatId);
    }

    // Default coordinator response
    return await this.coordinatorResponse(message, fromUser, chatId);
  }

  parseCommand(message) {
    const commandPattern = /@(\w+)\s+(.+)/;
    const match = message.match(commandPattern);
    
    if (match) {
      return {
        agent: match[1].toLowerCase(),
        task: match[2]
      };
    }
    
    return null;
  }

  findMentionedAgent(message) {
    const agentNames = Object.keys(AGENTS);
    const lowerMessage = message.toLowerCase();
    
    for (const agentId of agentNames) {
      const agent = AGENTS[agentId];
      const firstName = agent.name.split(' ')[0].toLowerCase();
      
      if (lowerMessage.includes(firstName) || lowerMessage.includes(`@${agentId}`)) {
        return agentId;
      }
    }
    
    return null;
  }

  async analyzeAndRoute(message, chatId) {
    const routingPrompt = `
Analyze this message and determine which PetMagix team member should handle it:

Message: "${message}"

Team members:
- sara: Marketing strategy, campaigns, growth
- amir: Creative copywriting, content creation
- laleh: Analytics, data analysis, metrics
- navid: Operations, project management, coordination
- neda: Market research, trends, opportunities

Respond with just the agent name (sara/amir/laleh/navid/neda) or "coordinator" if unclear.
    `;

    try {
      const response = await this.ai.generateResponse('coordinator', routingPrompt);
      const agentId = response.trim().toLowerCase();
      
      if (AGENTS[agentId]) {
        return agentId;
      }
    } catch (error) {
      console.error('Routing analysis failed:', error);
    }
    
    return null;
  }

  async handleCommand(command, fromUser, chatId) {
    const { agent, task } = command;
    
    if (!AGENTS[agent]) {
      return {
        agent: 'coordinator',
        response: `❌ Agent "${agent}" not found. Available agents: ${Object.keys(AGENTS).filter(a => a !== 'coordinator').join(', ')}`
      };
    }

    // Create task record
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.memory.saveTask(taskId, {
      taskId,
      assignedTo: agent,
      createdBy: fromUser.id,
      task,
      status: 'pending',
      createdAt: new Date()
    });

    // Route to agent
    return await this.routeToAgent(agent, task, fromUser, chatId, taskId);
  }

  async routeToAgent(agentId, message, fromUser, chatId, taskId = null) {
    const agent = AGENTS[agentId];
    
    // Get conversation context
    const context = await this.memory.getConversationContext(chatId);
    
    // Add current message to context
    context.messages.push({
      from: fromUser,
      message,
      timestamp: new Date(),
      taskId
    });

    // Generate agent response
    const response = await this.ai.generateResponse(agentId, message, {
      conversation: context,
      taskId,
      fromUser
    });

    // Update conversation context
    context.messages.push({
      from: { id: agentId, first_name: agent.name },
      message: response,
      timestamp: new Date()
    });

    await this.memory.saveConversationContext(chatId, context);

    // Update task status if applicable
    if (taskId) {
      await this.memory.saveTask(taskId, {
        status: 'completed',
        response,
        completedAt: new Date()
      });
    }

    return {
      agent: agentId,
      response: `${agent.emoji} ${response}`
    };
  }

  async coordinatorResponse(message, fromUser, chatId) {
    const context = await this.memory.getConversationContext(chatId);
    
    const response = await this.ai.generateResponse('coordinator', message, {
      conversation: context,
      fromUser,
      availableAgents: Object.keys(AGENTS).filter(a => a !== 'coordinator')
    });

    return {
      agent: 'coordinator',
      response: `🤖 ${response}`
    };
  }

  async getTeamStatus() {
    const agents = Object.keys(AGENTS).filter(a => a !== 'coordinator');
    const status = [];

    for (const agentId of agents) {
      const activeTasks = await this.memory.getActiveTasks(agentId);
      const agent = AGENTS[agentId];
      
      status.push({
        agent: agent.name,
        emoji: agent.emoji,
        activeTasks: activeTasks.length,
        role: agent.role
      });
    }

    return status;
  }
}

module.exports = CoordinatorService;
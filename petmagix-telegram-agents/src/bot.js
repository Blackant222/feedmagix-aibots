const TelegramBot = require('node-telegram-bot-api');
const MemoryService = require('./services/memory');
const AIService = require('./services/ai');
const CoordinatorService = require('./services/coordinator');
const { AGENTS } = require('./config/agents');

class PetMagixBotSystem {
  constructor() {
    this.bots = {};
    this.memory = new MemoryService();
    this.ai = new AIService();
    this.coordinator = new CoordinatorService(this.memory, this.ai);
    this.groupChatId = process.env.GROUP_CHAT_ID;
    this.ceoUserId = process.env.CEO_USER_ID;
  }

  async initialize() {
    await this.memory.initialize();
    
    // Initialize all agent bots
    for (const [agentId, agent] of Object.entries(AGENTS)) {
      const tokenKey = `${agentId.toUpperCase()}_BOT_TOKEN`;
      const token = process.env[tokenKey];
      
      if (!token) {
        console.warn(`No token found for ${agentId} (${tokenKey})`);
        continue;
      }

      const bot = new TelegramBot(token, { polling: true });
      this.bots[agentId] = bot;

      // Set up message handlers
      this.setupMessageHandlers(bot, agentId);
      
      console.log(`✅ ${agent.name} bot initialized`);
    }

    // Send startup message
    await this.sendStartupMessage();
  }

  setupMessageHandlers(bot, agentId) {
    const agent = AGENTS[agentId];

    // Handle text messages
    bot.on('message', async (msg) => {
      try {
        // Only respond in the designated group chat
        if (msg.chat.id.toString() !== this.groupChatId) {
          return;
        }

        // Skip messages from bots
        if (msg.from.is_bot) {
          return;
        }

        // Rate limiting
        const canProceed = await this.memory.checkRateLimit(msg.from.id);
        if (!canProceed) {
          return; // Silently ignore rate-limited messages
        }

        // Only coordinator handles routing
        if (agentId === 'coordinator') {
          const result = await this.coordinator.routeMessage(
            msg.text, 
            msg.from, 
            msg.chat.id
          );

          // Send response from the appropriate agent
          const responseBot = this.bots[result.agent];
          if (responseBot) {
            await responseBot.sendMessage(msg.chat.id, result.response);
          }
        }

      } catch (error) {
        console.error(`Error in ${agentId} bot:`, error);
        
        // Send error message only from coordinator
        if (agentId === 'coordinator') {
          await bot.sendMessage(
            msg.chat.id, 
            '🤖 متأسفم، مشکل فنی موقت دارم. لطفاً دوباره تلاش کنید.'
          );
        }
      }
    });

    // Handle commands
    bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === this.groupChatId) {
        await bot.sendMessage(msg.chat.id, agent.greeting || `${agent.emoji} ${agent.name} ready!`);
      }
    });

    bot.onText(/\/status/, async (msg) => {
      if (msg.chat.id.toString() === this.groupChatId && agentId === 'coordinator') {
        const status = await this.coordinator.getTeamStatus();
        const statusMessage = this.formatTeamStatus(status);
        await bot.sendMessage(msg.chat.id, statusMessage);
      }
    });

    bot.onText(/\/help/, async (msg) => {
      if (msg.chat.id.toString() === this.groupChatId && agentId === 'coordinator') {
        const helpMessage = this.getHelpMessage();
        await bot.sendMessage(msg.chat.id, helpMessage);
      }
    });
  }

  async sendStartupMessage() {
    const coordinatorBot = this.bots.coordinator;
    if (coordinatorBot && this.groupChatId) {
      const message = `
🚀 PetMagix AI Team is now online!

Available team members:
${Object.entries(AGENTS)
  .filter(([id]) => id !== 'coordinator')
  .map(([id, agent]) => `${agent.emoji} ${agent.name} - ${agent.role}`)
  .join('\n')}

Use @agent_name or mention them directly to assign tasks.
Type /help for more commands.

Ready to grow PetMagix! 🐾
      `.trim();

      await coordinatorBot.sendMessage(this.groupChatId, message);
    }
  }

  formatTeamStatus(status) {
    const header = '📊 Team Status Report\n\n';
    const teamStatus = status.map(member => 
      `${member.emoji} ${member.agent}\n` +
      `   Role: ${member.role}\n` +
      `   Active Tasks: ${member.activeTasks}`
    ).join('\n\n');

    return header + teamStatus;
  }

  getHelpMessage() {
    return `
🤖 PetMagix AI Team Commands

TASK ASSIGNMENT:
@sara create Instagram campaign
@amir write landing page copy
@laleh analyze conversion rates
@navid plan next sprint
@neda research pet food trends

GENERAL COMMANDS:
/status - Team status report
/help - This help message

DIRECT MENTIONS:
Just mention any team member's name in your message and they'll respond!

Example: "Sara, we need a marketing strategy for FeedMagix launch"
    `.trim();
  }

  async shutdown() {
    console.log('Shutting down PetMagix bot system...');
    
    // Stop all bots
    for (const [agentId, bot] of Object.entries(this.bots)) {
      try {
        await bot.stopPolling();
        console.log(`✅ ${agentId} bot stopped`);
      } catch (error) {
        console.error(`Error stopping ${agentId} bot:`, error);
      }
    }

    // Close memory connections
    await this.memory.close();
    console.log('✅ Memory services closed');
  }
}

module.exports = PetMagixBotSystem;
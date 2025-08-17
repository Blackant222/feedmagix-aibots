const TelegramBot = require('node-telegram-bot-api');

class CoordinatorBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: true });
    this.services = services;
    this.groupChatId = process.env.GROUP_CHAT_ID;
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.on('message', async (msg) => {
      if (msg.chat.id.toString() !== this.groupChatId || msg.from.is_bot) return;

      try {
        // Rate limiting
        const canProceed = await this.services.redis.checkRateLimit(msg.from.id);
        if (!canProceed) return;

        // Handle voice messages
        if (msg.voice) {
          const fileId = msg.voice.file_id;
          const file = await this.bot.getFile(fileId);
          const fileUrl = `https://api.telegram.org/file/bot${process.env.COORDINATOR_BOT_TOKEN}/${file.file_path}`;
          
          // Transcribe voice message
          const transcription = await this.services.openai.transcribeVoice(fileUrl);
          msg.text = transcription; // Replace voice with transcribed text
        }

        // Route message
        const result = await this.routeMessage(msg);
        
        // Send response from appropriate agent
        if (result.targetBot && result.response) {
          await result.targetBot.sendMessage(msg.chat.id, result.response);
        }
      } catch (error) {
        console.error('Coordinator error:', error);
        await this.bot.sendMessage(msg.chat.id, '🤖 مشکل فنی موقت. لطفاً دوباره تلاش کنید.');
      }
    });

    // Commands
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/status/, (msg) => this.handleStatus(msg));
    this.bot.onText(/\/briefing/, (msg) => this.handleBriefing(msg));
  }

  async routeMessage(msg) {
    const text = msg.text.toLowerCase();
    
    // Direct command: @agent task
    const commandMatch = text.match(/@(\w+)\s+(.+)/);
    if (commandMatch) {
      const agentId = commandMatch[1];
      const task = commandMatch[2];
      return await this.routeToAgent(agentId, task, msg);
    }

    // Natural mentions
    const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
    for (const agent of agents) {
      if (text.includes(agent)) {
        return await this.routeToAgent(agent, msg.text, msg);
      }
    }

    // Auto-route based on keywords
    if (text.includes('marketing') || text.includes('campaign')) {
      return await this.routeToAgent('sara', msg.text, msg);
    }
    if (text.includes('copy') || text.includes('content')) {
      return await this.routeToAgent('amir', msg.text, msg);
    }
    if (text.includes('analytics') || text.includes('data')) {
      return await this.routeToAgent('laleh', msg.text, msg);
    }
    if (text.includes('plan') || text.includes('sprint')) {
      return await this.routeToAgent('navid', msg.text, msg);
    }
    if (text.includes('research') || text.includes('market')) {
      return await this.routeToAgent('neda', msg.text, msg);
    }

    // Default coordinator response
    return await this.coordinatorResponse(msg);
  }

  async routeToAgent(agentId, message, msg) {
    const agentBot = this.services.bots[agentId];
    if (!agentBot) {
      return {
        targetBot: this.bot,
        response: `❌ Agent "${agentId}" not found. Available: sara, amir, laleh, navid, neda`
      };
    }

    // Get context
    const context = await this.services.redis.getContext(msg.chat.id);
    const agentMemory = await this.services.mongo.getAgentMemory(agentId);

    // Detect message type
    const messageType = msg.voice ? 'voice' : 'text';
    
    // Generate response
    const response = await this.services.openai.generateResponse(
      agentId, 
      message, 
      { conversation: context, ...agentMemory },
      messageType
    );

    // Update context
    context.messages.push(
      { from: msg.from, message, timestamp: new Date() },
      { from: { id: agentId }, message: response, timestamp: new Date() }
    );
    await this.services.redis.saveContext(msg.chat.id, context);

    const roles = require('../config/roles.json');
    const agent = roles[agentId];

    return {
      targetBot: agentBot.bot,
      response: `${agent.emoji} ${response}`
    };
  }

  async coordinatorResponse(msg) {
    const response = await this.services.openai.generateResponse(
      'coordinator',
      msg.text,
      { fromUser: msg.from }
    );

    return {
      targetBot: this.bot,
      response: `🤖 ${response}`
    };
  }

  async handleStart(msg) {
    if (msg.chat.id.toString() === this.groupChatId) {
      await this.bot.sendMessage(msg.chat.id, 
        '🚀 PetMagix AI Team activated!\n\n' +
        'Team: Sara🎯 Amir✍️ Laleh📊 Navid⚙️ Neda🔍\n' +
        'Commands: /status /briefing\n' +
        'Usage: @sara create campaign OR mention names directly'
      );
    }
  }

  async handleStatus(msg) {
    if (msg.chat.id.toString() === this.groupChatId) {
      const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
      let status = '📊 Team Status:\n\n';
      
      for (const agentId of agents) {
        const tasks = await this.services.mongo.getActiveTasks(agentId);
        const roles = require('../config/roles.json');
        status += `${roles[agentId].emoji} ${roles[agentId].name}: ${tasks.length} active tasks\n`;
      }
      
      await this.bot.sendMessage(msg.chat.id, status);
    }
  }

  async handleBriefing(msg) {
    if (msg.chat.id.toString() === this.groupChatId) {
      try {
        const companyProfile = require('../config/company-profile.json');
        const roles = require('../config/roles.json');
        
        await this.services.mongo.initializeTeamBriefing(companyProfile, roles);
        
        await this.bot.sendMessage(msg.chat.id, 
          '📋 Team briefing complete!\n\n' +
          '✅ Company profile loaded\n' +
          '✅ Agent personalities initialized\n' +
          '✅ PetMagix context distributed\n\n' +
          'Your AI team is now fully briefed and ready! 🐾'
        );
      } catch (error) {
        await this.bot.sendMessage(msg.chat.id, '❌ Briefing failed. Check logs.');
      }
    }
  }
}

module.exports = CoordinatorBot;
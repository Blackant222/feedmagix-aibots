const TelegramBot = require('node-telegram-bot-api');

class CoordinatorBot {
  constructor(token, services) {
    // Use polling only in development, webhook in production
    const usePolling = process.env.NODE_ENV !== 'production';
    this.bot = new TelegramBot(token, { polling: usePolling });
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

        // Process message
        await this.processMessage(msg);
      } catch (error) {
        console.error('Coordinator error:', error);
        await this.bot.sendMessage(msg.chat.id, '🤖 مشکل فنی موقت. لطفاً دوباره تلاش کنید.');
      }
    });

    // Commands
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
    this.bot.onText(/\/status/, (msg) => this.handleStatus(msg));
    this.bot.onText(/\/briefing/, (msg) => this.handleBriefing(msg));
    this.bot.onText(/\/team_intro/, (msg) => this.handleTeamIntro(msg));
  }

  async processMessage(msg) {
    try {
      const messageText = msg.text || '';
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      // Handle voice messages
      if (msg.voice) {
        const fileId = msg.voice.file_id;
        const file = await this.bot.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.COORDINATOR_BOT_TOKEN}/${file.file_path}`;
        
        const transcription = await this.services.openai.transcribeVoice(fileUrl);
        if (transcription) {
          msg.text = transcription;
          await this.bot.sendMessage(chatId, `🎤 متن پیام صوتی: "${transcription}"`);
        }
      }

      // Route to specific agent based on commands or natural mentions
      const routedAgent = this.routeMessageToAgent(messageText);
      
      if (routedAgent && routedAgent !== 'coordinator') {
        // Get the specific bot instance and generate response
        const botInstance = this.getBotInstance(routedAgent);
        if (botInstance && botInstance.generateResponse) {
          const response = await botInstance.generateResponse(
            messageText,
            { userId, chatId, fromCoordinator: true }
          );
          
          if (response) {
            await this.bot.sendMessage(chatId, response);
          }
        } else {
          // Fallback to OpenAI service
          const response = await this.services.openai.generateResponse(
            routedAgent,
            messageText,
            { userId, chatId },
            'text'
          );
          
          if (response) {
            await this.bot.sendMessage(chatId, response);
          }
        }
      } else {
        // Handle as coordinator with enhanced personality
        const response = await this.generateCoordinatorResponse(messageText, { userId, chatId });
        
        if (response) {
          await this.bot.sendMessage(chatId, response);
        }
      }
      
      // Update conversation context
      await this.services.redis.setConversationContext(userId, {
        lastMessage: messageText,
        timestamp: Date.now(),
        agent: routedAgent || 'coordinator'
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      await this.bot.sendMessage(msg.chat.id, '❌ خطایی در پردازش پیام رخ داد.');
    }
  }

  async processWebhookUpdate(update, botId) {
    try {
      if (update.message) {
        const msg = update.message;
        
        // Only process messages from the group chat
        if (msg.chat.id.toString() !== this.groupChatId || msg.from.is_bot) {
          return;
        }

        // Rate limiting
        const canProceed = await this.services.redis.checkRateLimit(msg.from.id);
        if (!canProceed) return;

        // Process the message
        await this.processMessage(msg);
      }
    } catch (error) {
      console.error(`Webhook processing error for ${botId}:`, error);
    }
  }

  getBotInstance(agentId) {
    // Return the actual bot instance from services
    return this.services.bots && this.services.bots[agentId] ? this.services.bots[agentId] : null;
  }

  async generateCoordinatorResponse(message, context) {
    const roles = require('../config/roles.json');
    const companyProfile = require('../config/company-profile.json');
    
    const systemPrompt = `تو ${roles.coordinator.name} هستی، ${roles.coordinator.role} تیم PetMagix.

شخصیت تو: ${roles.coordinator.personality}

تمرکز فعلی: ${roles.coordinator.current_focus}

اطلاعات شرکت:
- نام: ${companyProfile.company.name}
- محصول اصلی: ${companyProfile.flagship_product.name}
- هدف: ${companyProfile.company.vision}
- وضعیت محصول: ${companyProfile.flagship_product.status}

تیم تو:
${Object.entries(roles).filter(([id]) => id !== 'coordinator').map(([id, member]) => 
  `- ${member.name} (${member.role}): ${member.current_focus}`
).join('\n')}

تو رهبر این تیم هستی و مسئول هماهنگی و مدیریت پروژه‌ها. همیشه از اطلاعات تیم و شرکت استفاده کن و به صورت حرفه‌ای و دوستانه پاسخ بده.`;

    return await this.services.openai.generateResponse(
      'coordinator',
      message,
      { ...context, systemPrompt },
      'text'
    );
  }

  routeMessageToAgent(text) {
    const lowerText = text.toLowerCase();
    
    // Direct command: @agent task
    const commandMatch = lowerText.match(/@(\w+)\s+(.+)/);
    if (commandMatch) {
      return commandMatch[1];
    }

    // Natural mentions
    const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
    for (const agent of agents) {
      if (lowerText.includes(agent)) {
        return agent;
      }
    }

    // Auto-route based on keywords
    if (lowerText.includes('marketing') || lowerText.includes('campaign')) {
      return 'sara';
    }
    if (lowerText.includes('copy') || lowerText.includes('content')) {
      return 'amir';
    }
    if (lowerText.includes('analytics') || lowerText.includes('data')) {
      return 'laleh';
    }
    if (lowerText.includes('plan') || lowerText.includes('sprint')) {
      return 'navid';
    }
    if (lowerText.includes('research') || lowerText.includes('market')) {
      return 'neda';
    }

    // Default to coordinator
    return 'coordinator';
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

  // Enable cross-bot communication
  async enableCrossBotCommunication() {
    const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
    
    for (const agentId of agents) {
      const botInstance = this.getBotInstance(agentId);
      if (botInstance && botInstance.setCoordinator) {
        botInstance.setCoordinator(this);
      }
    }
  }

  // Method for bots to communicate with each other through coordinator
  async facilitateCrossBotMessage(fromAgent, toAgent, message, context = {}) {
    const toBotInstance = this.getBotInstance(toAgent);
    
    if (toBotInstance && toBotInstance.receiveMessage) {
      return await toBotInstance.receiveMessage(message, {
        ...context,
        fromAgent,
        facilitatedByCoordinator: true
      });
    }
    
    // Fallback to OpenAI service
    return await this.services.openai.generateResponse(
      toAgent,
      message,
      { ...context, fromAgent, facilitatedByCoordinator: true },
      'text'
    );
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
      const roles = require('../config/roles.json');
      await this.bot.sendMessage(msg.chat.id, 
        '🚀 تیم PetMagix آماده و آنلاین!\n\n' +
        `تیم ما: ${roles.sara.name}🎯 ${roles.amir.name}✍️ ${roles.laleh.name}📊 ${roles.navid.name}⚙️ ${roles.neda.name}🔍\n\n` +
        'دستورات: /status /briefing /team_intro\n' +
        'استفاده: @sara کمپین بساز یا مستقیم اسم بچه‌ها رو صدا بزن\n\n' +
        'ما یه تیم واقعی هستیم که با هم کار می‌کنیم تا PetMagix رو به بهترین برند حیوانات خانگی تبدیل کنیم! 🐾'
      );
    }
  }

  async handleStatus(msg) {
    if (msg.chat.id.toString() === this.groupChatId) {
      const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
      const roles = require('../config/roles.json');
      let status = '📊 وضعیت تیم PetMagix:\n\n';
      
      for (const agentId of agents) {
        const tasks = await this.services.mongo.getActiveTasks(agentId);
        status += `${roles[agentId].emoji} ${roles[agentId].name}: ${tasks.length} کار فعال\n`;
        status += `   تمرکز فعلی: ${roles[agentId].current_focus}\n\n`;
      }
      
      status += '🎯 هدف کلی: راه‌اندازی موفق FeedMagix\n';
      status += '📈 وضعیت اینستاگرام: @petmagix.ir (~6k فالوور)\n';
      status += '🚀 مرحله فعلی: نهایی کردن MVP';
      
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
          '📋 بریفینگ تیم کامل شد!\n\n' +
          '✅ پروفایل شرکت بارگذاری شد\n' +
          '✅ شخصیت‌های اعضای تیم فعال شد\n' +
          '✅ اطلاعات PetMagix به همه رسید\n' +
          '✅ روابط تیمی و همکاری‌ها تنظیم شد\n\n' +
          'تیم AI شما حالا کاملاً آماده و با اطلاعات کامل! 🐾\n' +
          'همه بچه‌ها از یکدیگر، از شرکت، و از اهدافمون باخبرن!'
        );
      } catch (error) {
        await this.bot.sendMessage(msg.chat.id, '❌ بریفینگ ناموفق. لاگ‌ها رو چک کن.');
      }
    }
  }

  async handleTeamIntro(msg) {
    if (msg.chat.id.toString() === this.groupChatId) {
      const roles = require('../config/roles.json');
      
      // Send coordinator intro first
      await this.bot.sendMessage(msg.chat.id, 
        `🤖 ${roles.coordinator.greeting}\n\n` +
        `📋 ${roles.coordinator.background}\n` +
        `🎯 ${roles.coordinator.current_focus}`
      );
      
      // Then trigger each team member to introduce themselves
      const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
      for (const agentId of agents) {
        const agent = roles[agentId];
        await this.bot.sendMessage(msg.chat.id, 
          `${agent.emoji} ${agent.greeting}\n\n` +
          `📋 ${agent.background}\n` +
          `🎯 ${agent.current_focus}\n\n` +
          `🤝 همکاری‌هام:\n` +
          Object.entries(agent.team_relationships).map(([teammate, relationship]) => 
            `• ${roles[teammate].name}: ${relationship}`
          ).join('\n')
        );
        
        // Small delay between introductions
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      await this.bot.sendMessage(msg.chat.id, 
        '🎉 معرفی تیم تمام شد!\n\n' +
        'حالا که همه رو شناختید، می‌تونید مستقیم با هر کدوم کار کنید.\n' +
        'ما یه تیم واقعی هستیم که با هم برای موفقیت PetMagix تلاش می‌کنیم! 💪🐾'
      );
    }
  }
}

module.exports = CoordinatorBot;
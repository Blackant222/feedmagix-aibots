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

      // Smart AI-driven routing with context awareness
      const routingDecision = await this.intelligentRouting(messageText, { userId, chatId });
      
      if (routingDecision.action === 'team_intro') {
        // Handle team introductions specially
        await this.handleTeamIntro(msg);
        return;
      }
      
      if (routingDecision.action === 'multi_agent') {
        // Route to multiple agents for collaboration
        await this.facilitateMultiAgentResponse(routingDecision.agents, messageText, { userId, chatId });
        return;
      }
      
      if (routingDecision.targetAgent && routingDecision.targetAgent !== 'coordinator') {
        // Route to specific agent
        await this.routeToSpecificAgent(routingDecision.targetAgent, messageText, { userId, chatId });
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

  async intelligentRouting(message, context) {
    const routingPrompt = `تو یک هماهنگ‌کننده هوشمند هستی. این پیام رو تحلیل کن و تصمیم بگیر:

پیام: "${message}"

گزینه‌های عمل:
1. team_intro - اگر کاربر می‌خواد تیم معرفی بشه
2. multi_agent - اگر نیاز به همکاری چند نفر هست
3. single_agent - اگر یک نفر خاص باید جواب بده
4. coordinator - اگر خودت باید جواب بدی

اعضای تیم:
- sara: مارکتینگ و استراتژی
- amir: کپی‌رایتینگ و محتوا
- laleh: آنالیتیکس و داده
- navid: پلن و پروژه
- neda: تحقیق و بازار

فقط یک JSON برگردون:
{
  "action": "team_intro|multi_agent|single_agent|coordinator",
  "targetAgent": "agent_name or null",
  "agents": ["agent1", "agent2"] or null,
  "reasoning": "دلیل تصمیمت"
}`;

    try {
      const response = await this.services.openai.generateResponse(
        'coordinator',
        routingPrompt,
        context,
        'text'
      );
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[^}]+\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Routing decision error:', error);
    }
    
    // Fallback to simple routing
    return {
      action: 'coordinator',
      targetAgent: null,
      agents: null,
      reasoning: 'Fallback to coordinator'
    };
  }

  async routeToSpecificAgent(agentId, message, context) {
    try {
      const response = await this.services.openai.generateResponse(
        agentId,
        message,
        context,
        'text'
      );
      
      if (response) {
        await this.bot.sendMessage(context.chatId, `🤖 ${agentId}: ${response}`);
      }
    } catch (error) {
      console.error(`Error routing to ${agentId}:`, error);
      await this.bot.sendMessage(context.chatId, `❌ مشکل در ارتباط با ${agentId}`);
    }
  }

  async facilitateMultiAgentResponse(agents, message, context) {
    const responses = [];
    
    for (const agentId of agents) {
      try {
        const agentContext = {
          ...context,
          collaborativeTask: true,
          otherAgents: agents.filter(a => a !== agentId)
        };
        
        const response = await this.services.openai.generateResponse(
          agentId,
          message,
          agentContext,
          'text'
        );
        
        if (response) {
          responses.push({ agent: agentId, response });
          await this.bot.sendMessage(context.chatId, `🤖 ${agentId}: ${response}`);
          
          // Small delay between responses
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.error(`Error with agent ${agentId}:`, error);
      }
    }
    
    // Coordinator summary
    if (responses.length > 1) {
      const summaryPrompt = `تیم نظراتشون رو دادن. یه خلاصه کوتاه و عملی بده:\n\n${responses.map(r => `${r.agent}: ${r.response}`).join('\n\n')}`;
      
      const summary = await this.services.openai.generateResponse(
        'coordinator',
        summaryPrompt,
        context,
        'text'
      );
      
      if (summary) {
        await this.bot.sendMessage(context.chatId, `📋 خلاصه هماهنگ‌کننده: ${summary}`);
      }
    }
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
      
      // Coordinator starts the introduction
      await this.bot.sendMessage(msg.chat.id, 
        `🤖 سلام! من هماهنگ‌کننده تیم PetMagix هستم.\n\n` +
        `بذارید تیم خودشون معرفی کنن... 👥`
      );
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Each agent introduces themselves with AI-generated responses
      const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
      for (const agentId of agents) {
        try {
          const introPrompt = `تو ${roles[agentId].name} هستی. خودت رو به صورت دوستانه و حرفه‌ای معرفی کن. شامل:\n- نقشت در تیم\n- تخصصت\n- چطور می‌تونی کمک کنی\n\nکوتاه و جذاب باش!`;
          
          const introduction = await this.services.openai.generateResponse(
            agentId,
            introPrompt,
            { userId: msg.from.id, chatId: msg.chat.id, isIntroduction: true },
            'text'
          );
          
          if (introduction) {
            await this.bot.sendMessage(msg.chat.id, `${roles[agentId].emoji} ${introduction}`);
          }
          
          // Delay between introductions
          await new Promise(resolve => setTimeout(resolve, 2500));
        } catch (error) {
          console.error(`Error with ${agentId} introduction:`, error);
          // Fallback to static intro
          await this.bot.sendMessage(msg.chat.id, 
            `${roles[agentId].emoji} ${roles[agentId].greeting}\n📋 ${roles[agentId].background}`
          );
        }
      }
      
      // Coordinator wraps up
      await this.bot.sendMessage(msg.chat.id, 
        '🎉 عالی! حالا که همه معرفی شدن، می‌تونید با هر کدوم کار کنید.\n\n' +
        '💡 نکته: من هماهنگ می‌کنم که بهترین نفر برای کارتون انتخاب بشه!\n' +
        '🚀 بیایید با هم PetMagix رو به بهترین اپ مراقبت از حیوانات تبدیل کنیم!'
      );
      
      // Trigger autonomous team interaction
      setTimeout(() => this.initiateTeamBonding(msg.chat.id), 5000);
    }
  }
  
  async initiateTeamBonding(chatId) {
    try {
      // Random team member starts a conversation
      const agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
      const initiator = agents[Math.floor(Math.random() * agents.length)];
      const target = agents.filter(a => a !== initiator)[Math.floor(Math.random() * 4)];
      
      const bondingPrompt = `تو ${initiator} هستی. یه پیام دوستانه و کاری به ${target} بفرست. مثلاً درباره یه ایده یا همکاری. کوتاه و طبیعی باش.`;
      
      const message = await this.services.openai.generateResponse(
        initiator,
        bondingPrompt,
        { chatId, teamBonding: true },
        'text'
      );
      
      if (message) {
        await this.bot.sendMessage(chatId, `💬 ${initiator} به ${target}: ${message}`);
        
        // Target responds
        setTimeout(async () => {
          const responsePrompt = `تو ${target} هستی. ${initiator} بهت گفت: "${message}". یه جواب مثبت و همکارانه بده.`;
          
          const response = await this.services.openai.generateResponse(
            target,
            responsePrompt,
            { chatId, teamBonding: true },
            'text'
          );
          
          if (response) {
            await this.bot.sendMessage(chatId, `💬 ${target}: ${response}`);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Team bonding error:', error);
    }
  }
}

module.exports = CoordinatorBot;
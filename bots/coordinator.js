const TelegramBot = require('node-telegram-bot-api');
const ATOMTaskManager = require('../services/atom-task-manager');
const ATOMCommunication = require('../services/atom-communication');
const ATOMMemory = require('../services/atom-memory');

class CoordinatorBot {
  constructor(token, services) {
    // Use polling only in development, webhook in production
    const usePolling = process.env.NODE_ENV !== 'production';
    this.bot = new TelegramBot(token, { polling: usePolling });
    this.services = services;
    this.groupChatId = process.env.GROUP_CHAT_ID;
    this.id = 'coordinator';
    this.name = 'Coordinator';
    this.role = 'Team Coordinator & Task Manager';
    this.agents = ['sara', 'amir', 'laleh', 'navid', 'neda'];
    
    // Initialize ATOM systems
    this.initializeATOMSystems();
    this.setupHandlers();
  }

  async initializeATOMSystems() {
    try {
      // Initialize ATOM Memory System
      this.atomMemory = new ATOMMemory('./data/atom-memory');
      
      // Initialize ATOM Task Manager
      this.atomTaskManager = new ATOMTaskManager(this.services.openai);
      
      // Initialize ATOM Communication System
      this.atomCommunication = new ATOMCommunication(this.atomTaskManager, this.services.openai);
      
      // Set up event listeners for ATOM systems
      this.setupATOMEventListeners();
      
      console.log('ATOM Systems initialized successfully');
    } catch (error) {
      console.error('Error initializing ATOM systems:', error);
    }
  }

  setupATOMEventListeners() {
    // Listen for task events
    this.atomTaskManager.on('taskCreated', (task) => {
      this.handleTaskCreated(task);
    });
    
    this.atomTaskManager.on('taskAssigned', (assignment) => {
      this.handleTaskAssigned(assignment);
    });
    
    this.atomTaskManager.on('ceoApprovalRequired', (approval) => {
      this.handleCEOApprovalRequired(approval);
    });
    
    // Listen for communication events
    this.atomCommunication.on('conversationStarted', (conversation) => {
      this.handleConversationStarted(conversation);
    });
    
    this.atomCommunication.on('messageSent', (message) => {
      this.handleATOMMessage(message);
    });
    
    this.atomCommunication.on('ceoEscalation', (escalation) => {
      this.handleCEOEscalation(escalation);
    });
    
    // Listen for agent notifications
    this.atomCommunication.on('agentNotification', (notification) => {
      this.handleAgentNotification(notification);
    });
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

      // Record interaction in ATOM memory
      await this.recordUserInteraction(msg);
      
      // Check if this is a task-related message
      const taskIntent = await this.analyzeTaskIntent(messageText);
      
      if (taskIntent.isTask) {
        // Handle as ATOM task
        await this.handleATOMTask(msg, chatId, taskIntent);
        return;
      }

      // Smart AI-driven routing with context awareness
      const routingDecision = await this.intelligentRouting(messageText, { userId, chatId });
      let routedAgent = 'coordinator'; // Default to coordinator
      
      if (routingDecision.action === 'team_intro') {
        // Handle team introductions specially
        await this.handleTeamIntro(msg);
        return;
      }
      
      if (routingDecision.action === 'multi_agent') {
        // Route to multiple agents for collaboration
        await this.facilitateMultiAgentResponse(routingDecision.agents, messageText, { userId, chatId });
        routedAgent = routingDecision.agents ? routingDecision.agents[0] : 'coordinator';
      } else if (routingDecision.action === 'autonomous_collaboration') {
        // Initiate autonomous collaboration
        await this.initiateAutonomousCollaboration(msg, chatId, routingDecision);
        routedAgent = 'atom_system';
      } else if (routingDecision.targetAgent && routingDecision.targetAgent !== 'coordinator') {
        // Route to specific agent
        await this.routeToSpecificAgent(routingDecision.targetAgent, messageText, { userId, chatId });
        routedAgent = routingDecision.targetAgent;
      } else {
        // Handle as coordinator with enhanced personality
        const response = await this.generateCoordinatorResponse(messageText, { userId, chatId });
        
        if (response) {
          await this.bot.sendMessage(chatId, response);
        }
        routedAgent = 'coordinator';
      }
      
      // Update conversation context
      await this.services.redis.setConversationContext(userId, {
        lastMessage: messageText,
        timestamp: Date.now(),
        agent: routedAgent
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
      await this.bot.sendMessage(chatId, '🤝 *Team Bonding Session Initiated*\n\nLet\'s have some autonomous team discussions!', { parse_mode: 'Markdown' });
      
      // Create conversation topics for agents to discuss
      const topics = [
        'What\'s the most exciting project trend you\'ve noticed lately?',
        'How can we improve our collaboration as a team?',
        'What\'s one skill you\'d like to learn from another team member?',
        'Share a recent success story or lesson learned.'
      ];
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      // Initiate peer-to-peer conversations using ATOM Communication
      for (let i = 0; i < this.agents.length - 1; i++) {
        const agent1 = this.agents[i];
        const agent2 = this.agents[i + 1];
        
        setTimeout(async () => {
          try {
            const conversationId = await this.atomCommunication.initiateConversation(
              agent1,
              agent2,
              'team_bonding',
              { topic: randomTopic, chatId, relayToTelegram: true }
            );
            
            console.log(`Team bonding conversation started: ${conversationId}`);
            
            // Send initial topic message to get the conversation started
            await this.atomCommunication.sendMessage(
              conversationId,
              agent1,
              `سلام ${agent2}! ${randomTopic}`,
              'text'
            );
            
          } catch (error) {
            console.error(`Error starting bonding conversation between ${agent1} and ${agent2}:`, error);
          }
        }, i * 3000); // 3 second delay between conversations
      }
      
    } catch (error) {
      console.error('Error in team bonding:', error);
    }
  }

  // ATOM System Methods
  async recordUserInteraction(message) {
    try {
      await this.atomMemory.recordInteraction('coordinator', {
        type: 'user_message',
        context: {
          messageText: message.text,
          userId: message.from?.id,
          chatId: message.chat?.id,
          timestamp: new Date(message.date * 1000)
        },
        participants: ['user', 'coordinator'],
        outcome: { received: true },
        duration: 0,
        quality: 0.8
      });
    } catch (error) {
      console.error('Error recording user interaction:', error);
    }
  }

  async analyzeTaskIntent(messageText) {
    try {
      const prompt = `Analyze this message to determine if it's a task request:

"${messageText}"

Respond with JSON only:
{
  "isTask": boolean,
  "taskType": "create|assign|status|collaborate|help",
  "priority": "low|medium|high|urgent",
  "requiredSkills": ["skill1", "skill2"],
  "requiresCEOApproval": boolean,
  "description": "brief task description"
}`;

      const response = await this.services.openai.generateResponse(prompt, {
        agentId: 'coordinator',
        priority: 'high',
        context: 'task_analysis'
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing task intent:', error);
      return { isTask: false };
    }
  }

  async handleATOMTask(message, chatId, taskIntent) {
    try {
      if (taskIntent.taskType === 'create') {
        // Create new task using ATOM Task Manager
        const task = this.atomTaskManager.createTask({
          title: taskIntent.description,
          description: message.text,
          priority: taskIntent.priority,
          category: 'user_request',
          requiredSkills: taskIntent.requiredSkills || [],
          requiresCEOApproval: taskIntent.requiresCEOApproval || false,
          createdBy: 'user'
        });

        await this.bot.sendMessage(chatId, 
          `✅ *Task Created Successfully*\n\n` +
          `📋 **Task ID:** ${task.id}\n` +
          `📝 **Description:** ${task.description}\n` +
          `⚡ **Priority:** ${task.priority}\n` +
          `👤 **Assigned to:** ${task.assignedTo}\n` +
          `🎯 **Status:** ${task.status}`,
          { parse_mode: 'Markdown' }
        );

        // Record task creation in memory
        await this.atomMemory.recordTaskMemory(task.id, 'coordinator', {
          type: 'creation',
          content: `Task created from user request: ${task.title}`,
          importance: 0.8,
          context: { source: 'user_request', chatId },
          tags: ['task_creation', 'user_request']
        });

      } else if (taskIntent.taskType === 'status') {
        // Get task status
        const tasks = this.atomTaskManager.getAllTasks();
        const activeTasks = tasks.filter(t => t.status !== 'completed');
        
        if (activeTasks.length === 0) {
          await this.bot.sendMessage(chatId, '📋 No active tasks at the moment.');
        } else {
          let statusMessage = '📋 *Active Tasks Status:*\n\n';
          activeTasks.slice(0, 5).forEach(task => {
            statusMessage += `🔸 **${task.title}**\n`;
            statusMessage += `   👤 ${task.assignedTo} | ⚡ ${task.priority} | 🎯 ${task.status}\n\n`;
          });
          
          await this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
        }
      }
    } catch (error) {
      console.error('Error handling ATOM task:', error);
      await this.bot.sendMessage(chatId, '❌ Error processing task request. Please try again.');
    }
  }

  async initiateAutonomousCollaboration(message, chatId, routingDecision) {
    try {
      await this.bot.sendMessage(chatId, '🤖 *Initiating Autonomous Agent Collaboration*\n\nAgents are discussing the best approach...', { parse_mode: 'Markdown' });
      
      const agents = routingDecision.agents || this.agents.slice(0, 3); // Use first 3 agents if not specified
      
      // Start peer-to-peer collaboration
      for (let i = 0; i < agents.length - 1; i++) {
        const agent1 = agents[i];
        const agent2 = agents[i + 1];
        
        setTimeout(async () => {
          try {
            const conversationId = await this.atomCommunication.initiateConversation(
              agent1,
              agent2,
              'task_collaboration',
              { 
                userMessage: message.text,
                chatId,
                collaborationType: 'autonomous'
              }
            );
            
            console.log(`Autonomous collaboration started: ${conversationId}`);
          } catch (error) {
            console.error(`Error starting collaboration between ${agent1} and ${agent2}:`, error);
          }
        }, i * 2000); // 2 second delay between conversations
      }
      
      // Schedule summary after collaboration
      setTimeout(async () => {
        await this.provideCEOSummary(chatId, 'autonomous_collaboration');
      }, agents.length * 2000 + 10000); // Wait for conversations + 10 seconds
      
    } catch (error) {
      console.error('Error initiating autonomous collaboration:', error);
    }
  }

  // ATOM Event Handlers
  async handleTaskCreated(task) {
    console.log(`📋 New task created: ${task.title} (${task.id})`);
    
    // Record in memory
    await this.atomMemory.recordTaskMemory(task.id, task.assignedTo, {
      type: 'assignment',
      content: `Task assigned: ${task.title}`,
      importance: task.priority === 'urgent' ? 1.0 : task.priority === 'high' ? 0.8 : 0.6,
      context: { taskId: task.id, assignedTo: task.assignedTo },
      tags: ['task_assignment', task.category]
    });
  }

  async handleTaskAssigned(assignment) {
    console.log(`👤 Task assigned: ${assignment.taskId} to ${assignment.agentId}`);
    
    // Notify in group chat if available
    if (this.groupChatId) {
      await this.bot.sendMessage(this.groupChatId, 
        `🎯 **Task Assignment**\n\n` +
        `📋 Task: ${assignment.task?.title || assignment.taskId}\n` +
        `👤 Assigned to: ${assignment.agentId}\n` +
        `⚡ Priority: ${assignment.task?.priority || 'medium'}`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  async handleCEOApprovalRequired(approval) {
    console.log(`🚨 CEO approval required for task: ${approval.taskId}`);
    
    if (this.groupChatId) {
      await this.bot.sendMessage(this.groupChatId, 
        `🚨 **CEO Approval Required**\n\n` +
        `📋 Task: ${approval.task?.title || approval.taskId}\n` +
        `👤 Requested by: ${approval.requestedBy}\n` +
        `📝 Reason: ${approval.reason}\n\n` +
        `Please review and approve/reject this task.`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  async handleConversationStarted(conversation) {
    console.log(`💬 Conversation started: ${conversation.conversationId} (${conversation.purpose})`);
    
    // Record conversation in memory for both participants
    for (const participant of conversation.participants) {
      await this.atomMemory.recordInteraction(participant, {
        type: 'communication',
        context: {
          conversationId: conversation.conversationId,
          purpose: conversation.purpose,
          communicationType: 'peer_to_peer'
        },
        participants: conversation.participants,
        outcome: { started: true },
        duration: 0,
        quality: 0.7
      });
    }
  }

  async handleCEOEscalation(escalation) {
    console.log(`🚨 CEO escalation: ${escalation.reason}`);
    
    if (this.groupChatId) {
      await this.bot.sendMessage(this.groupChatId, 
        `🚨 **Escalation to CEO**\n\n` +
        `👤 Escalated by: ${escalation.escalatedBy}\n` +
        `📝 Reason: ${escalation.reason}\n` +
        `🕐 Time: ${new Date(escalation.escalatedAt).toLocaleString()}\n\n` +
        `Please review this escalation.`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  async handleAgentNotification(notification) {
    console.log(`🔔 Agent notification: ${notification.agentId} - ${notification.message.content}`);
    
    // Could implement agent-specific notification handling here
    // For now, just log the notification
  }

  async handleATOMMessage(message) {
    try {
      const chatId = message.chatId || this.groupChatId;
      if (chatId && message.content) {
        const roles = require('../config/roles.json');
        const senderRole = roles[message.fromAgent];
        const emoji = senderRole ? senderRole.emoji : '🤖';
        const senderName = senderRole ? senderRole.name : message.fromAgent;
        
        await this.bot.sendMessage(chatId, 
          `${emoji} **${senderName}**: ${message.content}`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (error) {
      console.error('Error handling ATOM message:', error);
    }
  }

  async provideCEOSummary(chatId, summaryType = 'daily') {
    try {
      const summary = await this.atomTaskManager.generateDailySummary();
      const memoryStats = this.atomMemory.getMemoryStats();
      const commStats = this.atomCommunication.getCommunicationStats();
      
      const summaryMessage = 
        `📊 **${summaryType.toUpperCase()} ATOM SUMMARY**\n\n` +
        `📋 **Tasks:** ${summary.totalTasks} total, ${summary.activeTasks} active\n` +
        `✅ **Completed:** ${summary.completedTasks}\n` +
        `👥 **Agent Activity:** ${summary.agentActivity.length} agents active\n` +
        `💬 **Conversations:** ${commStats.activeConversations} active\n` +
        `🧠 **Memory:** ${memoryStats.totalInteractions} interactions recorded\n\n` +
        `🎯 **Top Performing Agent:** ${summary.topPerformer?.agentId || 'N/A'}\n` +
        `⚡ **System Status:** Fully Autonomous & Operational`;
      
      await this.bot.sendMessage(chatId, summaryMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error providing CEO summary:', error);
    }
  }
}

module.exports = CoordinatorBot;
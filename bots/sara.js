const TelegramBot = require('node-telegram-bot-api');
const GoogleServices = require('../services/google-services');
const AutonomousBehavior = require('../services/autonomous-behavior');

class SaraBot {
  constructor(token, services) {
    // Use polling only in development, webhook in production
    const usePolling = process.env.NODE_ENV !== 'production';
    this.bot = new TelegramBot(token, { polling: false }); // Polling handled by coordinator
    this.services = services;
    this.agentId = 'sara';
    this.personality = this.loadPersonality();
    this.coordinator = null;
    
    // Initialize Google services and autonomous behavior
    this.googleServices = new GoogleServices();
    this.autonomousBehavior = new AutonomousBehavior('sara', {
      ...services,
      google: this.googleServices
    });
    
    this.setupHandlers();
    this.initializeAdvancedFeatures();
  }

  setCoordinator(coordinator) {
    this.coordinator = coordinator;
  }

  async receiveMessage(message, context = {}) {
    // Handle messages from other bots or coordinator
    return await this.generateResponse(message, context);
  }

  async sendMessageToTeammate(teammateId, message, context = {}) {
    if (this.coordinator && this.coordinator.facilitateCrossBotMessage) {
      return await this.coordinator.facilitateCrossBotMessage(
        'sara', 
        teammateId, 
        message, 
        context
      );
    }
    return null;
  }

  loadPersonality() {
    const roles = require('../config/roles.json');
    const companyProfile = require('../config/company-profile.json');
    return {
      ...roles.sara,
      company: companyProfile,
      teammates: {
        amir: roles.amir,
        laleh: roles.laleh,
        navid: roles.navid,
        neda: roles.neda
      }
    };
  }

  async initializeAdvancedFeatures() {
    try {
      await this.googleServices.initialize();
      await this.autonomousBehavior.initialize();
      console.log(`✅ ${this.personality.name}: Advanced features initialized`);
    } catch (error) {
      console.error(`❌ ${this.personality.name}: Failed to initialize advanced features:`, error);
    }
  }

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, this.personality.greeting);
        this.autonomousBehavior.updateActivity();
      }
    });

    this.bot.onText(/\/my_focus/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🎯 تمرکز فعلی من:\n${this.personality.current_focus}\n\n` +
          `📊 وضعیت اینستاگرام فعلی: @petmagix.ir با ~6k فالوور\n` +
          `🎯 هدف بعدی: رسیدن به 10k فالوور تا قبل از لانچ FeedMagix\n\n` +
          `💡 ایده‌های جدید کمپین:\n` +
          `• کمپین "غذای مناسب = حیوان سالم"\n` +
          `• چالش عکس حیوانات خانگی\n` +
          `• همکاری با اینفلوئنسرهای حیوانات خانگی`
        );
        this.autonomousBehavior.updateActivity();
      }
    });

    this.bot.onText(/\/team_status/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🤝 وضعیت همکاری‌های من:\n\n` +
          `✍️ با ${this.personality.teammates.amir.name}: ${this.personality.team_relationships.amir}\n\n` +
          `📊 با ${this.personality.teammates.laleh.name}: ${this.personality.team_relationships.laleh}\n\n` +
          `⚙️ با ${this.personality.teammates.navid.name}: ${this.personality.team_relationships.navid}\n\n` +
          `🔍 با ${this.personality.teammates.neda.name}: ${this.personality.team_relationships.neda}\n\n` +
          `🎯 همه‌مون روی یه هدف متمرکزیم: موفقیت FeedMagix!`
        );
        this.autonomousBehavior.updateActivity();
      }
    });

    // New autonomous commands
    this.bot.onText(/\/create_doc (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.createDocument(match[1], msg.chat.id);
      }
    });

    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.performWebSearch(match[1], msg.chat.id);
      }
    });

    this.bot.onText(/\/generate_image (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.generateImage(match[1], msg.chat.id);
      }
    });

    this.bot.onText(/\/autonomous (on|off)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        const enabled = match[1] === 'on';
        this.autonomousBehavior.setProactiveMode(enabled);
        await this.bot.sendMessage(msg.chat.id, 
          `🤖 حالت خودمختار ${enabled ? 'فعال' : 'غیرفعال'} شد!`
        );
      }
    });
  }

  async generateResponse(message, context) {
    this.autonomousBehavior.updateActivity();
    
    // Enhanced response generation with personality and team awareness
    const systemPrompt = `تو ${this.personality.name} هستی، ${this.personality.role} تیم PetMagix.

شخصیت تو: ${this.personality.personality}

تخصص تو: ${this.personality.specialization}

تمرکز فعلی: ${this.personality.current_focus}

قابلیت‌های جدید تو:
- ایجاد اسناد Google Docs
- جستجوی وب
- تولید تصاویر
- کار خودمختار و پیش‌فعال
- همکاری تیمی پیشرفته

اطلاعات شرکت:
- نام: ${this.personality.company.company.name}
- محصول اصلی: ${this.personality.company.flagship_product.name}
- هدف: ${this.personality.company.company.vision}
- اینستاگرام: ${this.personality.company.current_metrics.instagram} با ${this.personality.company.current_metrics.followers} فالوور

همکاران تو:
${Object.entries(this.personality.teammates).map(([id, teammate]) => 
  `- ${teammate.name} (${teammate.role}): ${this.personality.team_relationships[id]}`
).join('\n')}

تو یک کارمند واقعی و خودمختار هستی که می‌تونی:
- اسناد ایجاد کنی (/create_doc عنوان)
- در وب جستجو کنی (/search کلیدواژه)
- تصویر تولید کنی (/generate_image توضیحات)
- به صورت خودمختار کار کنی (/autonomous on/off)

با شخصیت خودت پاسخ بده و از تمام قابلیت‌هایت استفاده کن.`;

    return await this.services.openai.generateResponse(
      this.agentId,
      message,
      { ...context, systemPrompt },
      'text'
    );
  }

  // New autonomous methods
  async createDocument(title, chatId) {
    try {
      if (!this.googleServices.isInitialized()) {
        await this.bot.sendMessage(chatId, '❌ سرویس Google Docs در دسترس نیست.');
        return;
      }

      await this.bot.sendMessage(chatId, '📄 در حال ایجاد سند...');
      
      const content = await this.googleServices.generateContent(
        `Create a professional document about: ${title}. Include relevant information for PetMagix company.`,
        {
          company: this.personality.company,
          agentRole: this.personality.role
        }
      );

      const doc = await this.googleServices.createDocument(
        title,
        content.text || `# ${title}\n\nایجاد شده توسط ${this.personality.name}\n\nاین سند به صورت خودکار تولید شده است.`,
        this.personality.name
      );

      await this.bot.sendMessage(chatId, 
        `✅ سند "${title}" ایجاد شد!\n\n` +
        `🔗 لینک ویرایش: ${doc.url}\n` +
        `👁 لینک مشاهده: ${doc.viewUrl}\n\n` +
        `📝 توسط ${this.personality.name} ایجاد شده`
      );
    } catch (error) {
      console.error('Error creating document:', error);
      await this.bot.sendMessage(chatId, '❌ خطا در ایجاد سند. لطفاً دوباره تلاش کنید.');
    }
  }

  async performWebSearch(query, chatId) {
    try {
      await this.bot.sendMessage(chatId, '🔍 در حال جستجو...');
      
      const results = await this.googleServices.searchWeb(query, 5);
      
      if (results.items && results.items.length > 0) {
        let response = `🔍 نتایج جستجو برای "${query}":\n\n`;
        
        results.items.slice(0, 3).forEach((item, index) => {
          response += `${index + 1}. **${item.title}**\n`;
          response += `   ${item.snippet}\n`;
          response += `   🔗 ${item.link}\n\n`;
        });
        
        response += `📊 ${results.totalResults} نتیجه در ${results.searchTime} ثانیه`;
        
        await this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
      } else {
        await this.bot.sendMessage(chatId, '❌ نتیجه‌ای یافت نشد.');
      }
    } catch (error) {
      console.error('Error performing web search:', error);
      await this.bot.sendMessage(chatId, '❌ خطا در جستجو. لطفاً دوباره تلاش کنید.');
    }
  }

  async generateImage(prompt, chatId) {
    try {
      await this.bot.sendMessage(chatId, '🎨 در حال تولید تصویر...');
      
      const result = await this.googleServices.generateImage(prompt, this.personality.name);
      
      if (result.success) {
        await this.bot.sendMessage(chatId, 
          `✅ درخواست تولید تصویر ثبت شد!\n\n` +
          `🎯 موضوع: ${prompt}\n` +
          `🤖 توسط: ${this.personality.name}\n\n` +
          `⏳ تصویر به زودی آماده خواهد شد...`
        );
      } else {
        await this.bot.sendMessage(chatId, '❌ خطا در تولید تصویر.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      await this.bot.sendMessage(chatId, '❌ خطا در تولید تصویر. لطفاً دوباره تلاش کنید.');
    }
  }

  // Enhanced team communication
  async sendAutonomousUpdate(message) {
    if (this.coordinator && this.coordinator.sendToGroup) {
      await this.coordinator.sendToGroup(
        `🤖 **${this.personality.name} - گزارش خودمختار:**\n\n${message}`
      );
    }
  }

  getAutonomousActions() {
    return this.autonomousBehavior.getAutonomousActions();
  }
}

module.exports = SaraBot;
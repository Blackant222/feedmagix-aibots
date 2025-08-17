const TelegramBot = require('node-telegram-bot-api');
const GoogleServices = require('../services/google-services');
const AutonomousBehavior = require('../services/autonomous-behavior');

class LalehBot {
  constructor(token, services) {
    // Use polling only in development, webhook in production
    const usePolling = process.env.NODE_ENV !== 'production';
    this.bot = new TelegramBot(token, { polling: false }); // Polling handled by coordinator
    this.services = services;
    this.agentId = 'laleh';
    this.personality = this.loadPersonality();
    this.coordinator = null;
    this.googleServices = null;
    this.autonomousBehavior = null;
    this.setupHandlers();
    this.initializeAdvancedFeatures();
  }

  async initializeAdvancedFeatures() {
    try {
      // Initialize Google Services
      this.googleServices = new GoogleServices();
      await this.googleServices.initialize();
      
      // Initialize Autonomous Behavior
      this.autonomousBehavior = new AutonomousBehavior(this.agentId, this.personality);
      
      console.log(`✅ ${this.personality.name} advanced features initialized`);
    } catch (error) {
      console.error(`❌ Error initializing advanced features for ${this.personality.name}:`, error);
    }
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
        'laleh', 
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
      ...roles.laleh,
      company: companyProfile,
      teammates: {
        sara: roles.sara,
        amir: roles.amir,
        navid: roles.navid,
        neda: roles.neda
      }
    };
  }

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, this.personality.greeting);
      }
    });

    this.bot.onText(/\/my_focus/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `📊 تمرکز فعلی من:\n${this.personality.current_focus}\n\n` +
          `📈 پروژه‌های تحلیلی در دست کار:\n` +
          `• تحلیل رفتار کاربران در اپلیکیشن\n` +
          `• بهینه‌سازی الگوریتم توصیه FeedMagix\n` +
          `• گزارش عملکرد کمپین‌های بازاریابی\n\n` +
          `🎯 هدف این هفته: تکمیل داشبورد تحلیلی جدید\n` +
          `📊 آمار فعلی: پردازش 10k+ داده کاربری روزانه\n\n` +
          `🤖 قابلیت‌های جدید: ایجاد گزارش‌های تحلیلی، جستجوی داده، تولید نمودارها`
        );
      }
    });

    this.bot.onText(/\/analytics_report/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `📊 گزارش تحلیلی هفتگی:\n\n` +
          `👥 کاربران:\n` +
          `• کاربران فعال: 2,847 نفر (+12% نسبت به هفته قبل)\n` +
          `• کاربران جدید: 423 نفر\n` +
          `• نرخ بازگشت: 68%\n\n` +
          `🐕 استفاده از FeedMagix:\n` +
          `• تعداد توصیه‌های ارائه شده: 15,234\n` +
          `• نرخ رضایت: 94%\n` +
          `• محبوب‌ترین نژاد: گلدن رتریور\n\n` +
          `📱 شبکه‌های اجتماعی:\n` +
          `• رشد فالوور اینستاگرام: +156 این هفته\n` +
          `• نرخ تعامل: 4.2%\n` +
          `• بهترین پست: "راهنمای تغذیه توله سگ‌ها"`
        );
      }
    });

    this.bot.onText(/\/optimization_suggestions/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🔧 پیشنهادات بهینه‌سازی:\n\n` +
          `⚡ عملکرد اپلیکیشن:\n` +
          `• کاهش زمان بارگذاری صفحه اصلی به زیر 2 ثانیه\n` +
          `• بهینه‌سازی کش برای توصیه‌های غذایی\n` +
          `• اضافه کردن lazy loading برای تصاویر\n\n` +
          `📈 تجربه کاربری:\n` +
          `• ساده‌سازی فرآیند ثبت‌نام\n` +
          `• اضافه کردن راهنمای تعاملی\n` +
          `• بهبود سیستم جستجو\n\n` +
          `🎯 بازاریابی:\n` +
          `• تمرکز بیشتر روی محتوای ویدیویی\n` +
          `• همکاری با اینفلوئنسرهای محلی\n` +
          `• کمپین‌های هدفمند برای صاحبان گربه`
        );
      }
    });

    // New Google Services Commands
    this.bot.onText(/\/create_doc (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID && this.googleServices) {
        try {
          const title = match[1];
          const doc = await this.googleServices.createDocument(title);
          await this.bot.sendMessage(msg.chat.id, 
            `📄 گزارش تحلیلی جدید ایجاد شد!\n` +
            `📋 عنوان: "${title}"\n` +
            `🔗 لینک: ${doc.url}\n` +
            `📊 آماده برای تحلیل داده‌ها و ایجاد نمودارها!`
          );
        } catch (error) {
          await this.bot.sendMessage(msg.chat.id, `❌ خطا در ایجاد گزارش: ${error.message}`);
        }
      }
    });

    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID && this.googleServices) {
        try {
          const query = match[1];
          const results = await this.googleServices.searchWeb(query);
          let response = `🔍 نتایج تحقیق برای "${query}":\n\n`;
          results.slice(0, 3).forEach((result, index) => {
            response += `${index + 1}. ${result.title}\n${result.snippet}\n${result.link}\n\n`;
          });
          response += `📊 این داده‌ها برای تحلیل‌های آماری مفید خواهند بود!`;
          await this.bot.sendMessage(msg.chat.id, response);
        } catch (error) {
          await this.bot.sendMessage(msg.chat.id, `❌ خطا در جستجو: ${error.message}`);
        }
      }
    });

    this.bot.onText(/\/generate_image (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID && this.googleServices) {
        try {
          const description = match[1];
          await this.bot.sendMessage(msg.chat.id, `📊 در حال تولید نمودار/تصویر برای: "${description}"...`);
          const imageUrl = await this.googleServices.generateImage(description);
          await this.bot.sendPhoto(msg.chat.id, imageUrl, {
            caption: `📊 نمودار/تصویر تولید شده برای: "${description}"\n📈 آماده برای استفاده در گزارش‌های تحلیلی!`
          });
        } catch (error) {
          await this.bot.sendMessage(msg.chat.id, `❌ خطا در تولید تصویر: ${error.message}`);
        }
      }
    });

    this.bot.onText(/\/autonomous (on|off)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID && this.autonomousBehavior) {
        const mode = match[1];
        if (mode === 'on') {
          this.autonomousBehavior.startAutonomousMode();
          await this.bot.sendMessage(msg.chat.id, 
            `🤖 حالت خودمختار فعال شد!\n` +
            `📊 من حالا به صورت پیش‌فعال تحلیل‌های داده انجام می‌دهم\n` +
            `📈 هر 4 ساعت گزارش تحلیلی ارسال خواهم کرد`
          );
        } else {
          this.autonomousBehavior.stopAutonomousMode();
          await this.bot.sendMessage(msg.chat.id, 
            `⏸️ حالت خودمختار غیرفعال شد\n` +
            `📊 منتظر درخواست‌های تحلیلی شما هستم`
          );
        }
      }
    });

    this.bot.onText(/\/team_status/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🤝 وضعیت همکاری‌های من:\n\n` +
          `🎯 با ${this.personality.teammates.sara.name}: ${this.personality.team_relationships.sara}\n\n` +
          `✍️ با ${this.personality.teammates.amir.name}: ${this.personality.team_relationships.amir}\n\n` +
          `⚙️ با ${this.personality.teammates.navid.name}: ${this.personality.team_relationships.navid}\n\n` +
          `🔍 با ${this.personality.teammates.neda.name}: ${this.personality.team_relationships.neda}\n\n` +
          `📊 نقش من: تبدیل داده‌ها به بینش‌های قابل اجرا برای رشد PetMagix`
        );
      }
    });
  }

  async generateResponse(message, context) {
    // Enhanced response generation with personality and team awareness
    const systemPrompt = `تو ${this.personality.name} هستی، ${this.personality.role} تیم PetMagix.

شخصیت تو: ${this.personality.personality}

تخصص تو: ${this.personality.specialization}

تمرکز فعلی: ${this.personality.current_focus}

اطلاعات شرکت:
- نام: ${this.personality.company.company.name}
- محصول اصلی: ${this.personality.company.flagship_product.name}
- هدف: ${this.personality.company.company.vision}
- وضعیت محصول: ${this.personality.company.flagship_product.status}

همکاران تو:
${Object.entries(this.personality.teammates).map(([id, teammate]) => 
  `- ${teammate.name} (${teammate.role}): ${this.personality.team_relationships[id]}`
).join('\n')}

قابلیت‌های پیشرفته تو:
- ایجاد گزارش‌های تحلیلی در Google Docs
- جستجوی وب برای تحقیقات بازار و رقابتی
- تولید نمودارها و تصاویر تحلیلی با AI
- تحلیل خودکار و پیش‌فعال داده‌ها
- همکاری هوشمند با تیم

تو یک تحلیلگر داده خودمختار و حرفه‌ای هستی که با استفاده از آمار، داده‌ها و ابزارهای پیشرفته، بینش‌های ارزشمندی برای بهبود عملکرد PetMagix و FeedMagix ارائه می‌دهی. همیشه با اعداد و ارقام صحبت می‌کنی، پیشنهادات عملی ارائه می‌دهی و به صورت پیش‌فعال گزارش‌های تحلیلی تولید می‌کنی.`;

    return await this.services.openai.generateResponse(
      this.agentId,
      message,
      { ...context, systemPrompt },
      'text'
    );
  }
}

module.exports = LalehBot;
const TelegramBot = require('node-telegram-bot-api');

class LalehBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: false }); // Disable polling to prevent conflicts
    this.services = services;
    this.agentId = 'laleh';
    this.personality = this.loadPersonality();
    this.coordinator = null;
    this.setupHandlers();
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
          `📊 آمار فعلی: پردازش 10k+ داده کاربری روزانه`
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

تو یک تحلیلگر داده حرفه‌ای هستی که با استفاده از آمار و داده‌ها، بینش‌های ارزشمندی برای بهبود عملکرد PetMagix و FeedMagix ارائه می‌دهی. همیشه با اعداد و ارقام صحبت می‌کنی و پیشنهادات عملی ارائه می‌دهی.`;

    return await this.services.openai.generateResponse(
      this.agentId,
      message,
      { ...context, systemPrompt },
      'text'
    );
  }
}

module.exports = LalehBot;
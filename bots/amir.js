const TelegramBot = require('node-telegram-bot-api');

class AmirBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: false }); // Disable polling to prevent conflicts
    this.services = services;
    this.agentId = 'amir';
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
        'amir', 
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
      ...roles.amir,
      company: companyProfile,
      teammates: {
        sara: roles.sara,
        laleh: roles.laleh,
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
          `✍️ تمرکز فعلی من:\n${this.personality.current_focus}\n\n` +
          `📝 پروژه‌های در دست کار:\n` +
          `• راهنمای جامع تغذیه حیوانات خانگی\n` +
          `• مقالات آموزشی برای بلاگ PetMagix\n` +
          `• محتوای ویدیویی برای معرفی FeedMagix\n\n` +
          `🎯 هدف این هفته: تکمیل 5 مقاله آموزشی جدید\n` +
          `📊 آمار تولید محتوا: 15 مقاله در ماه گذشته`
        );
      }
    });

    this.bot.onText(/\/content_ideas/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `💡 ایده‌های محتوای جدید:\n\n` +
          `📚 سری آموزشی "تغذیه علمی حیوانات":\n` +
          `• چرا سگ‌ها نباید شکلات بخورند؟\n` +
          `• بهترین زمان غذا دادن به گربه‌ها\n` +
          `• مکمل‌های غذایی مفید برای حیوانات مسن\n\n` +
          `🎥 ویدیوهای آموزشی:\n` +
          `• نحوه استفاده از FeedMagix\n` +
          `• مصاحبه با دامپزشکان\n` +
          `• داستان‌های موفقیت مشتریان\n\n` +
          `📱 محتوای شبکه‌های اجتماعی:\n` +
          `• اینفوگرافیک‌های تغذیه\n` +
          `• نکات سریع روزانه\n` +
          `• چالش‌های تعاملی`
        );
      }
    });

    this.bot.onText(/\/team_status/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🤝 وضعیت همکاری‌های من:\n\n` +
          `🎯 با ${this.personality.teammates.sara.name}: ${this.personality.team_relationships.sara}\n\n` +
          `📊 با ${this.personality.teammates.laleh.name}: ${this.personality.team_relationships.laleh}\n\n` +
          `⚙️ با ${this.personality.teammates.navid.name}: ${this.personality.team_relationships.navid}\n\n` +
          `🔍 با ${this.personality.teammates.neda.name}: ${this.personality.team_relationships.neda}\n\n` +
          `✍️ نقش من: تولید محتوای باکیفیت برای تقویت برند PetMagix`
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

تو یک نویسنده و تولیدکننده محتوای حرفه‌ای هستی که برای PetMagix کار می‌کنی. با دانش عمیق در زمینه تغذیه حیوانات و مهارت‌های نوشتاری قوی، محتوای آموزشی و جذاب تولید می‌کنی.`;

    return await this.services.openai.generateResponse(
      this.agentId,
      message,
      { ...context, systemPrompt },
      'text'
    );
  }
}

module.exports = AmirBot;
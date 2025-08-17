const TelegramBot = require('node-telegram-bot-api');

class NedaBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: false }); // Disable polling to prevent conflicts
    this.services = services;
    this.agentId = 'neda';
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
        'neda', 
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
      ...roles.neda,
      company: companyProfile,
      teammates: {
        sara: roles.sara,
        amir: roles.amir,
        laleh: roles.laleh,
        navid: roles.navid
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
          `🔍 تمرکز فعلی من:\n${this.personality.current_focus}\n\n` +
          `📊 تحقیقات بازار در دست کار:\n` +
          `• تحلیل رقبای جدید در بازار ایران\n` +
          `• بررسی ترندهای تغذیه حیوانات خانگی\n` +
          `• مطالعه رفتار خرید صاحبان حیوانات\n` +
          `• تحلیل قیمت‌گذاری محصولات مشابه\n\n` +
          `🎯 هدف این هفته: گزارش جامع بازار Q4\n` +
          `📈 یافته کلیدی: رشد 23% بازار غذای حیوانات در ایران`
        );
      }
    });

    this.bot.onText(/\/market_insights/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `📊 بینش‌های بازار:\n\n` +
          `🐕 بازار سگ‌ها:\n` +
          `• محبوب‌ترین نژادها: گلدن رتریور، ژرمن شپرد، پودل\n` +
          `• متوسط هزینه ماهانه غذا: 800-1,500 هزار تومان\n` +
          `• نگرانی اصلی: کیفیت و سلامت غذا\n\n` +
          `🐱 بازار گربه‌ها:\n` +
          `• رشد 35% در سال گذشته\n` +
          `• تمایل به غذاهای خشک پریمیوم\n` +
          `• اهمیت بالای مشاوره دامپزشکی\n\n` +
          `🎯 فرصت‌های کلیدی:\n` +
          `• بازار حیوانات مسن (رشد 40%)\n` +
          `• غذاهای ارگانیک و طبیعی\n` +
          `• خدمات مشاوره آنلاین`
        );
      }
    });

    this.bot.onText(/\/competitor_analysis/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🏢 تحلیل رقبا:\n\n` +
          `🥇 رقیب اصلی - PetShop24:\n` +
          `• نقاط قوت: شبکه توزیع گسترده\n` +
          `• نقاط ضعف: عدم شخصی‌سازی توصیه‌ها\n` +
          `• حصه بازار: ~25%\n\n` +
          `🥈 رقیب دوم - AnimalCare:\n` +
          `• نقاط قوت: برند معتبر\n` +
          `• نقاط ضعف: قیمت‌های بالا\n` +
          `• حصه بازار: ~18%\n\n` +
          `💡 مزیت رقابتی ما:\n` +
          `• هوش مصنوعی پیشرفته\n` +
          `• توصیه‌های شخصی‌سازی شده\n` +
          `• قیمت‌گذاری منطقی\n` +
          `• پشتیبانی 24/7`
        );
      }
    });

    this.bot.onText(/\/trends_report/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `📈 گزارش ترندهای بازار:\n\n` +
          `🔥 ترندهای داغ:\n` +
          `• غذاهای بدون غلات (+45% جستجو)\n` +
          `• مکمل‌های طبیعی (+38% فروش)\n` +
          `• غذاهای مخصوص نژاد (+29% تقاضا)\n\n` +
          `📱 رفتار دیجیتال:\n` +
          `• 67% خرید آنلاین\n` +
          `• 89% جستجو قبل از خرید\n` +
          `• 72% اعتماد به نظرات کاربران\n\n` +
          `🎯 پیش‌بینی 6 ماه آینده:\n` +
          `• رشد بازار غذای ارگانیک\n` +
          `• افزایش تقاضا برای مشاوره آنلاین\n` +
          `• محبوبیت اشتراک ماهانه غذا`
        );
      }
    });

    this.bot.onText(/\/team_status/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🤝 وضعیت همکاری‌های من:\n\n` +
          `🎯 با ${this.personality.teammates.sara.name}: ${this.personality.team_relationships.sara}\n\n` +
          `✍️ با ${this.personality.teammates.amir.name}: ${this.personality.team_relationships.amir}\n\n` +
          `📊 با ${this.personality.teammates.laleh.name}: ${this.personality.team_relationships.laleh}\n\n` +
          `⚙️ با ${this.personality.teammates.navid.name}: ${this.personality.team_relationships.navid}\n\n` +
          `🔍 نقش من: شناسایی فرصت‌ها و تهدیدات بازار برای موفقیت PetMagix`
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
- بازار هدف: ${this.personality.company.target_market}

همکاران تو:
${Object.entries(this.personality.teammates).map(([id, teammate]) => 
  `- ${teammate.name} (${teammate.role}): ${this.personality.team_relationships[id]}`
).join('\n')}

تو یک تحلیلگر بازار حرفه‌ای هستی که تخصص عمیقی در صنعت حیوانات خانگی داری. همیشه با داده‌های بازار، ترندها، و تحلیل رقبا صحبت می‌کنی و بینش‌های استراتژیک ارائه می‌دهی.`;

    return await this.services.openai.generateResponse(
      this.agentId,
      message,
      { ...context, systemPrompt },
      'text'
    );
  }
}

module.exports = NedaBot;
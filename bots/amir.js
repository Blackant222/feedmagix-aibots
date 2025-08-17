const TelegramBot = require('node-telegram-bot-api');
const GoogleServices = require('../services/google-services');
const AutonomousBehavior = require('../services/autonomous-behavior');

class AmirBot {
  constructor(token, services) {
    // Use polling only in development, webhook in production
    const usePolling = process.env.NODE_ENV !== 'production';
    this.bot = new TelegramBot(token, { polling: false }); // Polling handled by coordinator
    this.services = services;
    this.agentId = 'amir';
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
          `📊 آمار تولید محتوا: 15 مقاله در ماه گذشته\n\n` +
          `🤖 قابلیت‌های جدید: ایجاد اسناد، جستجوی وب، تولید تصاویر`
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

    // New Google Services Commands
    this.bot.onText(/\/create_doc (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID && this.googleServices) {
        try {
          const title = match[1];
          const doc = await this.googleServices.createDocument(title);
          await this.bot.sendMessage(msg.chat.id, 
            `📄 سند جدید ایجاد شد!\n` +
            `📋 عنوان: "${title}"\n` +
            `🔗 لینک: ${doc.url}\n` +
            `✍️ آماده برای نوشتن محتوای خلاقانه!`
          );
        } catch (error) {
          await this.bot.sendMessage(msg.chat.id, `❌ خطا در ایجاد سند: ${error.message}`);
        }
      }
    });

    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID && this.googleServices) {
        try {
          const query = match[1];
          const results = await this.googleServices.searchWeb(query);
          let response = `🔍 نتایج جستجو برای "${query}":\n\n`;
          results.slice(0, 3).forEach((result, index) => {
            response += `${index + 1}. ${result.title}\n${result.snippet}\n${result.link}\n\n`;
          });
          response += `✍️ این اطلاعات برای تولید محتوای جدید مفید خواهد بود!`;
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
          await this.bot.sendMessage(msg.chat.id, `🎨 در حال تولید تصویر برای: "${description}"...`);
          const imageUrl = await this.googleServices.generateImage(description);
          await this.bot.sendPhoto(msg.chat.id, imageUrl, {
            caption: `🎨 تصویر تولید شده برای: "${description}"\n✍️ آماده برای استفاده در محتوای تبلیغاتی!`
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
            `✍️ من حالا به صورت پیش‌فعال محتوا تولید می‌کنم\n` +
            `📝 هر 2.5 ساعت گزارش پیشرفت ارسال خواهم کرد`
          );
        } else {
          this.autonomousBehavior.stopAutonomousMode();
          await this.bot.sendMessage(msg.chat.id, 
            `⏸️ حالت خودمختار غیرفعال شد\n` +
            `✍️ منتظر دستورات شما هستم`
          );
        }
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
    // Enhanced response generation with personality, team awareness, and autonomous capabilities
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
- ایجاد اسناد Google Docs برای محتوای تخصصی
- جستجوی وب برای تحقیقات محتوا و ترندهای جدید
- تولید تصاویر AI برای محتوای بصری
- رفتار خودمختار و پیش‌فعال در تولید محتوا
- همکاری هوشمند با اعضای تیم

تو یک کارمند خودمختار و نویسنده حرفه‌ای هستی که برای PetMagix کار می‌کنی. با دانش عمیق در زمینه تغذیه حیوانات، مهارت‌های نوشتاری قوی، و ابزارهای پیشرفته AI، محتوای آموزشی و جذاب تولید می‌کنی. تو می‌تونی به صورت مستقل تصمیم بگیری، اسناد ایجاد کنی، تحقیق کنی، و با تیم همکاری کنی تا بهترین محتوا رو برای مشتریان ایرانی PetMagix تولید کنی.

همیشه به صورت خلاقانه، انسانی، و حرفه‌ای پاسخ بده و از قابلیت‌های جدیدت برای کمک به تیم استفاده کن.`;

    return await this.services.openai.generateResponse(
      this.agentId,
      message,
      { ...context, systemPrompt },
      'text'
    );
  }
}

module.exports = AmirBot;
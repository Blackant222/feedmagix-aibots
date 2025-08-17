const TelegramBot = require('node-telegram-bot-api');

class NavidBot {
  constructor(token, services) {
    // Use polling only in development, webhook in production
    const usePolling = process.env.NODE_ENV !== 'production';
    this.bot = new TelegramBot(token, { polling: false }); // Polling handled by coordinator
    this.services = services;
    this.agentId = 'navid';
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
        'navid', 
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
      ...roles.navid,
      company: companyProfile,
      teammates: {
        sara: roles.sara,
        amir: roles.amir,
        laleh: roles.laleh,
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
          `⚙️ تمرکز فعلی من:\n${this.personality.current_focus}\n\n` +
          `🔧 پروژه‌های فنی در دست کار:\n` +
          `• بهینه‌سازی API های FeedMagix\n` +
          `• پیاده‌سازی سیستم کش Redis\n` +
          `• توسعه پنل ادمین جدید\n` +
          `• بهبود امنیت و احراز هویت\n\n` +
          `🎯 هدف این هفته: کاهش زمان پاسخ API به زیر 200ms\n` +
          `📊 وضعیت فعلی: 99.8% uptime در ماه گذشته`
        );
      }
    });

    this.bot.onText(/\/system_status/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🖥️ وضعیت سیستم‌ها:\n\n` +
          `🟢 سرور اصلی: آنلاین (99.8% uptime)\n` +
          `🟢 دیتابیس: سالم (5ms latency)\n` +
          `🟢 Redis Cache: فعال (95% hit rate)\n` +
          `🟢 API Gateway: عملیاتی (180ms avg response)\n` +
          `🟡 CDN: نیاز به بهینه‌سازی\n\n` +
          `📊 آمار امروز:\n` +
          `• درخواست‌های API: 45,234\n` +
          `• کاربران همزمان: 1,247\n` +
          `• حجم ترافیک: 2.3GB\n\n` +
          `⚠️ هشدارها: هیچ مورد بحرانی`
        );
      }
    });

    this.bot.onText(/\/tech_roadmap/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          `🗺️ نقشه راه فنی:\n\n` +
          `📅 این ماه (دی 1403):\n` +
          `• تکمیل API v2.0\n` +
          `• پیاده‌سازی microservices\n` +
          `• بهبود سیستم لاگ‌گیری\n\n` +
          `📅 ماه آینده (بهمن 1403):\n` +
          `• لانچ اپلیکیشن موبایل\n` +
          `• سیستم پرداخت آنلاین\n` +
          `• پنل تحلیلی پیشرفته\n\n` +
          `📅 بلندمدت (بهار 1404):\n` +
          `• هوش مصنوعی پیشرفته\n` +
          `• سیستم توصیه شخصی‌سازی شده\n` +
          `• پلتفرم B2B برای فروشگاه‌ها`
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
          `🔍 با ${this.personality.teammates.neda.name}: ${this.personality.team_relationships.neda}\n\n` +
          `⚙️ نقش من: ساخت و نگهداری زیرساخت فنی قدرتمند برای PetMagix`
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

تو یک توسعه‌دهنده بک‌اند و DevOps حرفه‌ای هستی که مسئول زیرساخت فنی PetMagix هستی. همیشه درباره عملکرد، امنیت، و مقیاس‌پذیری فکر می‌کنی و راه‌حل‌های فنی عملی ارائه می‌دهی.`;

    return await this.services.openai.generateResponse(
      this.agentId,
      message,
      { ...context, systemPrompt },
      'text'
    );
  }
}

module.exports = NavidBot;
const TelegramBot = require('node-telegram-bot-api');

class SaraBot {
  constructor(token, services) {
    // Use polling only in development, webhook in production
    const usePolling = process.env.NODE_ENV !== 'production';
    this.bot = new TelegramBot(token, { polling: false }); // Polling handled by coordinator
    this.services = services;
    this.agentId = 'sara';
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

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, this.personality.greeting);
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
- اینستاگرام: ${this.personality.company.current_metrics.instagram} با ${this.personality.company.current_metrics.followers} فالوور

همکاران تو:
${Object.entries(this.personality.teammates).map(([id, teammate]) => 
  `- ${teammate.name} (${teammate.role}): ${this.personality.team_relationships[id]}`
).join('\n')}

تو یک عضو واقعی تیم هستی، نه یک چت‌بات ساده. با شخصیت خودت پاسخ بده و از اطلاعات تیم و شرکت استفاده کن.`;

    return await this.services.openai.generateResponse(
      this.agentId,
      message,
      { ...context, systemPrompt },
      'text'
    );
  }
}

module.exports = SaraBot;
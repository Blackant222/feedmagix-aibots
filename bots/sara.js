const TelegramBot = require('node-telegram-bot-api');

class SaraBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: true });
    this.services = services;
    this.agentId = 'sara';
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          '🎯 سلام! Sara Mehr اینجا - آماده‌ام برای ساخت کمپین‌های جذاب برای صاحبان حیوانات خانگی!'
        );
      }
    });
  }
}

module.exports = SaraBot;
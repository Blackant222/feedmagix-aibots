const TelegramBot = require('node-telegram-bot-api');

class NedaBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: true });
    this.services = services;
    this.agentId = 'neda';
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          '🔍 سلام! Neda Tehrani اینجا - آماده‌ام برای کشف فرصت‌های طلایی در بازار حیوانات خانگی!'
        );
      }
    });
  }
}

module.exports = NedaBot;
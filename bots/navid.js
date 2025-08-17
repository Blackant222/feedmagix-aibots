const TelegramBot = require('node-telegram-bot-api');

class NavidBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: true });
    this.services = services;
    this.agentId = 'navid';
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          '⚙️ سلام تیم! Navid Ramin اینجا - بیایید نقشه‌راه را به اسپرینت‌های قابل اجرا تبدیل کنیم!'
        );
      }
    });
  }
}

module.exports = NavidBot;
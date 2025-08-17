const TelegramBot = require('node-telegram-bot-api');

class AmirBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: true });
    this.services = services;
    this.agentId = 'amir';
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          '✍️ سلام دوستان! Amir Kaviani اینجا - بیایید داستان‌هایی بنویسیم که دل صاحبان حیوانات را لمس کند!'
        );
      }
    });
  }
}

module.exports = AmirBot;
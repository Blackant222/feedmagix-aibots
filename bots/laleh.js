const TelegramBot = require('node-telegram-bot-api');

class LalehBot {
  constructor(token, services) {
    this.bot = new TelegramBot(token, { polling: true });
    this.services = services;
    this.agentId = 'laleh';
    this.setupHandlers();
  }

  setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      if (msg.chat.id.toString() === process.env.GROUP_CHAT_ID) {
        await this.bot.sendMessage(msg.chat.id, 
          '📊 Hello! Laleh Shadmehr here - Ready to dive into data and uncover insights that drive FeedMagix growth!'
        );
      }
    });
  }
}

module.exports = LalehBot;
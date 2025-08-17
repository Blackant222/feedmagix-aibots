const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config(); // if using .env file

const token = process.env.COORDINATOR_BOT_TOKEN; // pick one bot to clear
const bot = new TelegramBot(token, { polling: false });

bot.deleteWebhook().then(() => {
    console.log("Webhook cleared for", token);
    process.exit(0);
}).catch(err => {
    console.error("Error clearing webhook:", err);
    process.exit(1);
});

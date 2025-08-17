const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// All bot tokens from environment
const botTokens = [
  process.env.COORDINATOR_BOT_TOKEN,
  process.env.SARA_BOT_TOKEN,
  process.env.AMIR_BOT_TOKEN,
  process.env.LALEH_BOT_TOKEN,
  process.env.NAVID_BOT_TOKEN,
  process.env.NEDA_BOT_TOKEN
].filter(token => token); // Remove undefined tokens

async function clearAllWebhooks() {
  console.log(`🧹 Clearing webhooks for ${botTokens.length} bots...`);
  
  const promises = botTokens.map(async (token, index) => {
    try {
      const bot = new TelegramBot(token, { polling: false });
      await bot.setWebHook(''); // Clear webhook by setting empty URL
      console.log(`✅ Webhook cleared for bot ${index + 1}`);
      return { success: true, token: token.substring(0, 10) + '...' };
    } catch (error) {
      console.error(`❌ Failed to clear webhook for bot ${index + 1}:`, error.message);
      return { success: false, token: token.substring(0, 10) + '...', error: error.message };
    }
  });
  
  const results = await Promise.all(promises);
  
  console.log('\n📊 Webhook clearing results:');
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`✅ Bot ${index + 1} (${result.token}): Cleared`);
    } else {
      console.log(`❌ Bot ${index + 1} (${result.token}): ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎯 Summary: ${successCount}/${results.length} webhooks cleared successfully`);
  
  if (successCount === results.length) {
    console.log('✅ All webhooks cleared! You can now start the application.');
  } else {
    console.log('⚠️ Some webhooks failed to clear. Check the errors above.');
  }
}

clearAllWebhooks()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
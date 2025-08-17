const fs = require('fs').promises;
const path = require('path');

class AutonomousBehavior {
  constructor(botName, services) {
    this.botName = botName;
    this.services = services;
    this.personality = null;
    this.workSchedule = {
      startHour: 9,
      endHour: 18,
      timezone: 'Asia/Tehran'
    };
    this.autonomousActions = [];
    this.lastActivity = new Date();
    this.proactiveMode = true;
  }

  async initialize() {
    try {
      // Load personality and role data
      const rolesData = await fs.readFile(path.join(__dirname, '../config/roles.json'), 'utf8');
      const roles = JSON.parse(rolesData);
      this.personality = roles[this.botName] || {};
      
      console.log(`🤖 ${this.botName}: Autonomous behavior initialized`);
      
      // Start autonomous behavior loop
      this.startAutonomousLoop();
    } catch (error) {
      console.error(`❌ ${this.botName}: Failed to initialize autonomous behavior:`, error);
    }
  }

  startAutonomousLoop() {
    // Check for autonomous actions every 30 minutes
    setInterval(() => {
      this.performAutonomousActions();
    }, 30 * 60 * 1000);

    // Daily morning briefing
    this.scheduleDailyBriefing();
  }

  async performAutonomousActions() {
    if (!this.isWorkingHours()) {
      return;
    }

    try {
      const timeSinceLastActivity = Date.now() - this.lastActivity.getTime();
      const hoursIdle = timeSinceLastActivity / (1000 * 60 * 60);

      // If idle for more than 2 hours, perform proactive actions
      if (hoursIdle > 2 && this.proactiveMode) {
        await this.performProactiveWork();
      }

      // Check for pending tasks or updates
      await this.checkForUpdates();
      
    } catch (error) {
      console.error(`❌ ${this.botName}: Error in autonomous actions:`, error);
    }
  }

  async performProactiveWork() {
    const actions = this.getProactiveActions();
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    console.log(`🤖 ${this.botName}: Performing proactive action: ${randomAction.name}`);
    
    try {
      await randomAction.execute();
      this.lastActivity = new Date();
    } catch (error) {
      console.error(`❌ ${this.botName}: Error in proactive action:`, error);
    }
  }

  getProactiveActions() {
    const baseActions = [
      {
        name: 'market_research',
        execute: async () => {
          if (this.services.google?.isInitialized()) {
            const searchResults = await this.services.google.searchWeb('pet care trends Iran 2025', 3);
            await this.createResearchReport(searchResults);
          }
        }
      },
      {
        name: 'team_status_update',
        execute: async () => {
          await this.sendTeamStatusUpdate();
        }
      },
      {
        name: 'content_creation',
        execute: async () => {
          await this.createDailyContent();
        }
      }
    ];

    // Add role-specific actions
    const roleSpecificActions = this.getRoleSpecificActions();
    return [...baseActions, ...roleSpecificActions];
  }

  getRoleSpecificActions() {
    const role = this.personality?.role?.toLowerCase() || '';
    
    switch (role) {
      case 'marketing strategist':
        return [
          {
            name: 'campaign_analysis',
            execute: async () => {
              await this.analyzeCampaignPerformance();
            }
          },
          {
            name: 'competitor_research',
            execute: async () => {
              if (this.services.google?.isInitialized()) {
                const competitors = await this.services.google.searchWeb('pet food companies Iran competitors', 5);
                await this.createCompetitorReport(competitors);
              }
            }
          }
        ];
      
      case 'creative content writer':
        return [
          {
            name: 'content_ideas',
            execute: async () => {
              await this.generateContentIdeas();
            }
          },
          {
            name: 'social_media_posts',
            execute: async () => {
              await this.createSocialMediaContent();
            }
          }
        ];
      
      case 'data analyst':
        return [
          {
            name: 'data_insights',
            execute: async () => {
              await this.generateDataInsights();
            }
          },
          {
            name: 'performance_metrics',
            execute: async () => {
              await this.analyzePerformanceMetrics();
            }
          }
        ];
      
      default:
        return [];
    }
  }

  async createResearchReport(searchResults) {
    if (!this.services.google?.isInitialized()) return;

    try {
      const reportContent = `
# گزارش تحقیقات بازار - ${new Date().toLocaleDateString('fa-IR')}

تهیه شده توسط: ${this.personality?.name || this.botName}

## خلاصه یافته‌ها:

${searchResults.items?.map((item, index) => `
${index + 1}. **${item.title}**
   - لینک: ${item.link}
   - خلاصه: ${item.snippet}
`).join('\n') || 'هیچ نتیجه‌ای یافت نشد'}

## تحلیل:
این گزارش به صورت خودکار توسط سیستم هوش مصنوعی PetMagix تهیه شده است.

---
تاریخ: ${new Date().toISOString()}
      `;

      const doc = await this.services.google.createDocument(
        `گزارش تحقیقات بازار - ${new Date().toLocaleDateString('fa-IR')}`,
        reportContent,
        this.personality?.name || this.botName
      );

      console.log(`📄 ${this.botName}: Created research report: ${doc.url}`);
      
      // Notify team about the new report
      await this.notifyTeam(`📊 گزارش جدید تحقیقات بازار آماده شد:\n${doc.viewUrl}`);
      
    } catch (error) {
      console.error(`❌ ${this.botName}: Error creating research report:`, error);
    }
  }

  async sendTeamStatusUpdate() {
    const status = {
      agent: this.personality?.name || this.botName,
      role: this.personality?.role || 'Team Member',
      currentFocus: this.personality?.current_focus || 'General tasks',
      lastActivity: this.lastActivity.toLocaleString('fa-IR'),
      workingHours: this.isWorkingHours() ? 'در حال کار' : 'خارج از ساعت کاری',
      capabilities: this.services.google?.getCapabilities() || {}
    };

    const message = `
🤖 **گزارش وضعیت ${status.agent}**

📋 نقش: ${status.role}
🎯 تمرکز فعلی: ${status.currentFocus}
⏰ آخرین فعالیت: ${status.lastActivity}
💼 وضعیت کاری: ${status.workingHours}

#StatusUpdate #${this.botName}
    `;

    await this.notifyTeam(message);
  }

  async createDailyContent() {
    if (!this.services.google?.isInitialized()) return;

    try {
      const companyData = await this.loadCompanyProfile();
      
      const contentPrompt = `
Create daily content for PetMagix social media in Persian.
Focus on: ${this.personality?.current_focus || 'pet care tips'}
Tone: ${this.personality?.personality || 'friendly and professional'}
Include relevant hashtags and call-to-action.
      `;

      const content = await this.services.google.generateContent(contentPrompt, {
        company: companyData,
        agentRole: this.personality?.role
      });

      if (content.success) {
        await this.notifyTeam(`📝 **محتوای روزانه جدید:**\n\n${content.text}\n\n#DailyContent #${this.botName}`);
      }
    } catch (error) {
      console.error(`❌ ${this.botName}: Error creating daily content:`, error);
    }
  }

  async notifyTeam(message) {
    // This will be integrated with the Telegram bot to send messages to the group
    console.log(`📢 ${this.botName} Team Notification:`, message);
    
    // Store notification for later delivery
    this.autonomousActions.push({
      type: 'team_notification',
      message: message,
      timestamp: new Date(),
      agent: this.botName
    });
  }

  async loadCompanyProfile() {
    try {
      const profileData = await fs.readFile(path.join(__dirname, '../config/company-profile.json'), 'utf8');
      return JSON.parse(profileData);
    } catch (error) {
      console.error('Error loading company profile:', error);
      return {};
    }
  }

  isWorkingHours() {
    const now = new Date();
    const tehranTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tehran"}));
    const hour = tehranTime.getHours();
    
    return hour >= this.workSchedule.startHour && hour < this.workSchedule.endHour;
  }

  scheduleDailyBriefing() {
    // Schedule daily briefing at 9 AM Tehran time
    const now = new Date();
    const tehranTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tehran"}));
    
    // Calculate milliseconds until next 9 AM
    const tomorrow9AM = new Date(tehranTime);
    tomorrow9AM.setHours(9, 0, 0, 0);
    if (tomorrow9AM <= tehranTime) {
      tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
    }
    
    const msUntil9AM = tomorrow9AM.getTime() - tehranTime.getTime();
    
    setTimeout(() => {
      this.sendDailyBriefing();
      // Schedule for next day
      setInterval(() => {
        this.sendDailyBriefing();
      }, 24 * 60 * 60 * 1000);
    }, msUntil9AM);
  }

  async sendDailyBriefing() {
    const briefing = `
🌅 **صبح بخیر تیم PetMagix!**

${this.personality?.name || this.botName} در خدمت شما هستم.

📋 **برنامه امروز:**
- ${this.personality?.current_focus || 'انجام وظایف روزانه'}
- بررسی و پاسخ به پیام‌های جدید
- تحلیل عملکرد و ارائه گزارش

💪 آماده همکاری و خدمت‌رسانی هستم!

#DailyBriefing #${this.botName}
    `;

    await this.notifyTeam(briefing);
  }

  // Methods for specific role actions
  async analyzeCampaignPerformance() {
    console.log(`📊 ${this.botName}: Analyzing campaign performance...`);
    // Implementation for campaign analysis
  }

  async createCompetitorReport(competitors) {
    console.log(`🔍 ${this.botName}: Creating competitor analysis report...`);
    // Implementation for competitor analysis
  }

  async generateContentIdeas() {
    console.log(`💡 ${this.botName}: Generating new content ideas...`);
    // Implementation for content idea generation
  }

  async createSocialMediaContent() {
    console.log(`📱 ${this.botName}: Creating social media content...`);
    // Implementation for social media content creation
  }

  async generateDataInsights() {
    console.log(`📈 ${this.botName}: Generating data insights...`);
    // Implementation for data analysis
  }

  async analyzePerformanceMetrics() {
    console.log(`📊 ${this.botName}: Analyzing performance metrics...`);
    // Implementation for performance analysis
  }

  // Public methods for external interaction
  updateActivity() {
    this.lastActivity = new Date();
  }

  setProactiveMode(enabled) {
    this.proactiveMode = enabled;
    console.log(`🤖 ${this.botName}: Proactive mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  getAutonomousActions() {
    return this.autonomousActions;
  }

  clearAutonomousActions() {
    this.autonomousActions = [];
  }
}

module.exports = AutonomousBehavior;
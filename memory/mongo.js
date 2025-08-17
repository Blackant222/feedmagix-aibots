const { createClient } = require('@supabase/supabase-js');

class SupabaseMemory {
  constructor() {
    this.client = null;
  }

  async connect() {
    this.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    // Create tables if they don't exist
    await this.initializeTables();
    console.log('✅ Supabase connected');
  }

  async initializeTables() {
    try {
      // Create agent_memory table
      await this.client.rpc('create_agent_memory_table');
      
      // Create tasks table  
      await this.client.rpc('create_tasks_table');
      
      // Create company_knowledge table
      await this.client.rpc('create_company_knowledge_table');
    } catch (error) {
      // Tables might already exist, that's ok
      console.log('Tables initialization:', error.message);
    }
  }

  async saveAgentMemory(agentId, memory) {
    const { error } = await this.client
      .from('agent_memory')
      .upsert({
        agent_id: agentId,
        ...memory,
        updated_at: new Date().toISOString()
      });
    
    if (error) console.error('Save agent memory error:', error);
  }

  async getAgentMemory(agentId) {
    const { data, error } = await this.client
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agentId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Get agent memory error:', error);
    }
    
    return data;
  }

  async saveTask(taskId, task) {
    const { error } = await this.client
      .from('tasks')
      .upsert({
        task_id: taskId,
        ...task,
        updated_at: new Date().toISOString()
      });
    
    if (error) console.error('Save task error:', error);
  }

  async getActiveTasks(agentId) {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('assigned_to', agentId)
      .in('status', ['pending', 'in_progress']);
    
    if (error) {
      console.error('Get active tasks error:', error);
      return [];
    }
    
    return data || [];
  }

  async initializeTeamBriefing(companyProfile, roles) {
    // Save company profile
    const { error: companyError } = await this.client
      .from('company_knowledge')
      .upsert({
        type: 'company_profile',
        data: companyProfile,
        updated_at: new Date().toISOString()
      });
    
    if (companyError) console.error('Company profile save error:', companyError);

    // Initialize each agent's memory
    for (const [agentId, role] of Object.entries(roles)) {
      await this.saveAgentMemory(agentId, {
        personality: role.personality,
        specialization: role.specialization,
        company_context: companyProfile,
        briefing_complete: true
      });
    }
    
    console.log('✅ Team briefing initialized in Supabase');
  }

  async close() {
    // Supabase client doesn't need explicit closing
    console.log('✅ Supabase connection closed');
  }
}

module.exports = SupabaseMemory;
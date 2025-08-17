-- PetMagix AI Agents - Supabase Database Setup
-- Run these commands in your Supabase SQL Editor

-- Create agent_memory table
CREATE TABLE IF NOT EXISTS agent_memory (
    id SERIAL PRIMARY KEY,
    agent_id TEXT UNIQUE NOT NULL,
    personality TEXT,
    specialization TEXT,
    company_context JSONB,
    briefing_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task_id TEXT UNIQUE NOT NULL,
    assigned_to TEXT NOT NULL,
    created_by TEXT,
    task TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create company_knowledge table
CREATE TABLE IF NOT EXISTS company_knowledge (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_id ON agent_memory(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_company_knowledge_type ON company_knowledge(type);

-- Create RPC functions for table creation (used by the app)
CREATE OR REPLACE FUNCTION create_agent_memory_table()
RETURNS void AS $$
BEGIN
    -- Table creation is handled above, this is just a placeholder
    RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_tasks_table()
RETURNS void AS $$
BEGIN
    -- Table creation is handled above, this is just a placeholder
    RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_company_knowledge_table()
RETURNS void AS $$
BEGIN
    -- Table creation is handled above, this is just a placeholder
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) for better security
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_knowledge ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust as needed for production)
CREATE POLICY "Allow all operations on agent_memory" ON agent_memory FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on company_knowledge" ON company_knowledge FOR ALL USING (true);
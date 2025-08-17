# 🤖 PetMagix Telegram Multi-Agent System Architecture

## System Overview

```mermaid
graph TB
    subgraph "Telegram Group Chat"
        CEO[👨‍💼 Arshia Tehrani - CEO]
        COORD[🤖 Coordinator Bot]
        SARA[👩‍💼 Sara Mehr - Marketing]
        AMIR[👨‍💻 Amir Kaviani - Copywriter]
        LALEH[👩‍💻 Laleh Shadmehr - Analytics]
        NAVID[👨‍💼 Navid Ramin - COO]
        NEDA[👩‍💼 Neda Tehrani - Market Analyst]
    end

    subgraph "Cloud Infrastructure (Free Tier)"
        WEBHOOK[Webhook Handler<br/>Railway/Render]
        REDIS[Redis Cloud<br/>Memory Store]
        DB[MongoDB Atlas<br/>Free Tier]
    end

    subgraph "AI Services"
        GPT5[GPT-5-nano-2025-08-07]
        GPT4O[GPT-4o-search-preview]
        GPTIMG[GPT-image-1]
        GPTTTS[GPT-4o-mini-tts]
        GPTAUDIO[GPT-4o-audio-preview]
        COMPUTER[Computer-use-preview]
    end

    CEO --> COORD
    COORD --> SARA
    COORD --> AMIR
    COORD --> LALEH
    COORD --> NAVID
    COORD --> NEDA
    
    SARA -.-> AMIR
    AMIR -.-> LALEH
    LALEH -.-> NAVID
    NAVID -.-> NEDA
    NEDA -.-> SARA

    WEBHOOK --> REDIS
    WEBHOOK --> DB
    WEBHOOK --> GPT5
    WEBHOOK --> GPT4O
    WEBHOOK --> GPTIMG
    WEBHOOK --> GPTTTS
    WEBHOOK --> GPTAUDIO
    WEBHOOK --> COMPUTER
```

## Communication Flow

```mermaid
sequenceDiagram
    participant CEO as 👨‍💼 CEO
    participant COORD as 🤖 Coordinator
    participant AGENT as 👩‍💼 Agent
    participant OTHER as 👨‍💻 Other Agents

    CEO->>COORD: "@sara create Instagram campaign for FeedMagix"
    COORD->>COORD: Parse command & route
    COORD->>AGENT: Forward task with context
    AGENT->>AGENT: Process with assigned LLM
    AGENT->>COORD: Task completed + results
    COORD->>CEO: Summary report
    AGENT->>OTHER: Collaborate if needed
    OTHER->>AGENT: Provide input
    AGENT->>COORD: Final deliverable
```

## Cost Optimization Strategy

```mermaid
graph LR
    subgraph "Cost Minimization"
        A[Smart Routing] --> B[Context Caching]
        B --> C[Batch Processing]
        C --> D[Model Selection]
        D --> E[Rate Limiting]
    end

    subgraph "Free Infrastructure"
        F[Railway Free Tier] --> G[MongoDB Atlas Free]
        G --> H[Redis Cloud Free]
        H --> I[GitHub Actions CI/CD]
    end
```

## Agent Personality Matrix

| Agent | Primary LLM | Personality | Language Preference | Specialization |
|-------|-------------|-------------|-------------------|----------------|
| Sara | GPT-5-nano | Strategic, Creative | Persian/English | Marketing Strategy |
| Amir | GPT-5-nano + TTS | Emotional, Storyteller | Persian | Creative Copy |
| Laleh | GPT-5-nano + Computer | Analytical, Precise | English | Data Analysis |
| Navid | GPT-5-nano + Computer | Organized, Efficient | Persian/English | Operations |
| Neda | GPT-4o-search | Insightful, Research-focused | Persian/English | Market Research |

## Memory & Context System

```mermaid
graph TB
    subgraph "Memory Layers"
        SHORT[Short-term Memory<br/>Redis - 24h]
        MEDIUM[Medium-term Memory<br/>MongoDB - 30 days]
        LONG[Long-term Memory<br/>MongoDB - Permanent]
    end

    subgraph "Context Types"
        CONV[Conversation Context]
        TASK[Task Context]
        COMPANY[Company Knowledge]
        PERSONAL[Agent Personality]
    end

    SHORT --> MEDIUM
    MEDIUM --> LONG
    CONV --> SHORT
    TASK --> MEDIUM
    COMPANY --> LONG
    PERSONAL --> LONG
```
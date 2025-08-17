# 🤖 FeedMagix AI Agentic Workflow - Mermaid Diagram

## Complete System Architecture Flow

```mermaid
flowchart TD
    %% User Input Layer
    TG[📱 Telegram User] --> MSG[📨 Incoming Message]
    MSG --> WEBHOOK[🔗 Webhook Endpoint]
    
    %% Main Server Processing
    WEBHOOK --> SERVER[🖥️ Server.js]
    SERVER --> COORD[🎯 Coordinator Bot]
    
    %% Coordinator Intelligence Layer
    COORD --> INTEL[🧠 Intelligent Routing]
    INTEL --> ANALYZE{🔍 AI Analysis\nUser Intent}
    
    %% Routing Decision Tree
    ANALYZE -->|Team Introduction| TEAM_INTRO[👥 Team Introduction]
    ANALYZE -->|Multi-Agent Task| MULTI_AGENT[🤝 Multi-Agent Response]
    ANALYZE -->|Specific Agent| SINGLE_AGENT[👤 Single Agent Routing]
    ANALYZE -->|General Query| COORD_RESP[💬 Coordinator Response]
    
    %% Team Introduction Flow
    TEAM_INTRO --> COORD_INTRO[📢 Coordinator Introduction]
    COORD_INTRO --> SARA_INTRO[👩‍💼 Sara Introduction]
    SARA_INTRO --> AMIR_INTRO[👨‍💻 Amir Introduction]
    AMIR_INTRO --> LALEH_INTRO[👩‍🎨 Laleh Introduction]
    LALEH_INTRO --> NAVID_INTRO[👨‍📊 Navid Introduction]
    NAVID_INTRO --> NEDA_INTRO[👩‍🔬 Neda Introduction]
    NEDA_INTRO --> TEAM_BOND[🤗 Team Bonding Session]
    
    %% Individual Agent Processing
    SINGLE_AGENT --> SARA[👩‍💼 Sara - Marketing Expert]
    SINGLE_AGENT --> AMIR[👨‍💻 Amir - Tech Lead]
    SINGLE_AGENT --> LALEH[👩‍🎨 Laleh - Creative Director]
    SINGLE_AGENT --> NAVID[👨‍📊 Navid - Data Analyst]
    SINGLE_AGENT --> NEDA[👩‍🔬 Neda - Research Specialist]
    
    %% Multi-Agent Collaboration
    MULTI_AGENT --> COLLAB_SARA[👩‍💼 Sara Response]
    MULTI_AGENT --> COLLAB_AMIR[👨‍💻 Amir Response]
    MULTI_AGENT --> COLLAB_LALEH[👩‍🎨 Laleh Response]
    COLLAB_SARA --> SUMMARY[📋 Coordinator Summary]
    COLLAB_AMIR --> SUMMARY
    COLLAB_LALEH --> SUMMARY
    
    %% AI Services Layer
    SARA --> GEMINI_25_PRO[🚀 Gemini 2.5 Pro]
    AMIR --> GEMINI_25_FLASH[⚡ Gemini 2.5 Flash]
    LALEH --> GEMINI_20_FLASH[💫 Gemini 2.0 Flash]
    NAVID --> GEMINI_25_FLASH
    NEDA --> GEMINI_25_PRO
    COORD_RESP --> GEMINI_25_PRO
    
    %% Google Services Integration
    GEMINI_25_PRO --> GOOGLE_SERVICES[🌐 Google Services]
    GEMINI_25_FLASH --> GOOGLE_SERVICES
    GEMINI_20_FLASH --> GOOGLE_SERVICES
    
    GOOGLE_SERVICES --> DOCS[📄 Google Docs]
    GOOGLE_SERVICES --> DRIVE[💾 Google Drive]
    GOOGLE_SERVICES --> SEARCH[🔍 Google Search]
    GOOGLE_SERVICES --> IMAGEN[🎨 Google Imagen]
    
    %% Response Generation
    DOCS --> RESPONSE[📤 Generated Response]
    DRIVE --> RESPONSE
    SEARCH --> RESPONSE
    IMAGEN --> RESPONSE
    SUMMARY --> RESPONSE
    TEAM_BOND --> RESPONSE
    
    %% Output Layer
    RESPONSE --> TG_SEND[📱 Send to Telegram]
    TG_SEND --> USER_RECEIVE[✅ User Receives Response]
    
    %% Autonomous Behavior Layer
    AUTO_BEHAVIOR[🤖 Autonomous Behavior] -.-> SARA
    AUTO_BEHAVIOR -.-> AMIR
    AUTO_BEHAVIOR -.-> LALEH
    AUTO_BEHAVIOR -.-> NAVID
    AUTO_BEHAVIOR -.-> NEDA
    
    %% Memory & Context
    MEMORY[(🧠 Memory System)] -.-> COORD
    MEMORY -.-> SARA
    MEMORY -.-> AMIR
    MEMORY -.-> LALEH
    MEMORY -.-> NAVID
    MEMORY -.-> NEDA
    
    %% Styling
    classDef userLayer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef coordLayer fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef agentLayer fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef aiLayer fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef serviceLayer fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    
    class TG,MSG,WEBHOOK userLayer
    class COORD,INTEL,ANALYZE coordLayer
    class SARA,AMIR,LALEH,NAVID,NEDA agentLayer
    class GEMINI_25_PRO,GEMINI_25_FLASH,GEMINI_20_FLASH aiLayer
    class GOOGLE_SERVICES,DOCS,DRIVE,SEARCH,IMAGEN serviceLayer
```

## Agent Specializations & Capabilities

```mermaid
mindmap
  root((🤖 AI Agents))
    👩‍💼 Sara
      Marketing Strategy
      Social Media
      Brand Management
      Customer Engagement
    👨‍💻 Amir
      Technical Development
      System Architecture
      Code Review
      DevOps
    👩‍🎨 Laleh
      Creative Design
      Visual Content
      Brand Identity
      User Experience
    👨‍📊 Navid
      Data Analysis
      Business Intelligence
      Performance Metrics
      Reporting
    👩‍🔬 Neda
      Research & Development
      Market Analysis
      Innovation
      Strategic Planning
    🎯 Coordinator
      Message Routing
      Team Coordination
      Workflow Management
      Decision Making
```

## Google AI Model Distribution

```mermaid
flowchart LR
    subgraph "🚀 Gemini 2.5 Pro"
        SARA_PRO[👩‍💼 Sara - High Priority]
        NEDA_PRO[👩‍🔬 Neda - Research]
        COORD_PRO[🎯 Coordinator - Complex]
    end
    
    subgraph "⚡ Gemini 2.5 Flash"
        AMIR_FLASH[👨‍💻 Amir - Important]
        NAVID_FLASH[👨‍📊 Navid - Analytics]
    end
    
    subgraph "💫 Gemini 2.0 Flash"
        LALEH_REGULAR[👩‍🎨 Laleh - Regular]
        OTHER_REGULAR[🔄 Other Tasks]
    end
    
    TASK_PRIORITY{Task Priority} --> SARA_PRO
    TASK_PRIORITY --> AMIR_FLASH
    TASK_PRIORITY --> LALEH_REGULAR
```

## Autonomous Behavior Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant C as 🎯 Coordinator
    participant S as 👩‍💼 Sara
    participant A as 👨‍💻 Amir
    participant L as 👩‍🎨 Laleh
    
    U->>C: "Introduce the team in Persian"
    C->>C: 🧠 Analyze Intent
    C->>U: 📢 Coordinator Introduction
    
    C->>S: Generate your introduction
    S->>S: 🤖 AI-Generated Response
    S->>U: 👩‍💼 Sara's Introduction
    
    C->>A: Generate your introduction
    A->>A: 🤖 AI-Generated Response
    A->>U: 👨‍💻 Amir's Introduction
    
    C->>L: Generate your introduction
    L->>L: 🤖 AI-Generated Response
    L->>U: 👩‍🎨 Laleh's Introduction
    
    C->>C: 🤗 Initiate Team Bonding
    C->>S: Start autonomous conversation
    S->>A: 💬 "How's the new project going?"
    A->>L: 💬 "Need any design input?"
    L->>S: 💬 "Let's collaborate on branding!"
    
    Note over C,L: 🔄 Autonomous interactions continue...
```

## System Architecture Overview

```mermaid
C4Context
    title FeedMagix AI Agentic System Context
    
    Person(user, "Telegram User", "Interacts with AI agents")
    
    System_Boundary(ai_system, "AI Agentic System") {
        Container(coordinator, "Coordinator Bot", "Node.js", "Routes messages and manages team")
        Container(agents, "AI Agents", "Node.js", "Specialized AI personalities")
        Container(google_ai, "Google AI Services", "Gemini Models", "AI processing and generation")
        Container(google_services, "Google Services", "APIs", "Docs, Drive, Search, Imagen")
    }
    
    System_Ext(telegram, "Telegram API", "Messaging platform")
    System_Ext(render, "Render", "Hosting platform")
    
    Rel(user, telegram, "Sends messages")
    Rel(telegram, coordinator, "Webhook")
    Rel(coordinator, agents, "Routes to")
    Rel(agents, google_ai, "Uses")
    Rel(agents, google_services, "Integrates with")
    Rel(coordinator, user, "Responds via Telegram")
    
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

---

## 🎯 Key Features Highlighted:

1. **🧠 Intelligent Routing**: AI-driven message analysis and routing
2. **🤖 Autonomous Agents**: Self-generating responses and interactions
3. **🤝 Team Collaboration**: Multi-agent responses and team bonding
4. **🚀 Latest AI Models**: Gemini 2.0/2.5 Flash and Pro
5. **🌐 Google Integration**: Full Google services ecosystem
6. **📱 Telegram Interface**: Seamless user interaction
7. **🔄 Auto-Deployment**: GitHub Actions to Render

---

*This diagram represents the complete agentic workflow of your AI system, showing how intelligent routing, autonomous behavior, and team collaboration work together to create a living, breathing AI office environment.*
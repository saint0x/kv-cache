```mermaid
graph TD
    %% Modern Color Scheme with black text except decisions
    classDef input fill:#e3f2fd,stroke:#2196f3,color:#000
    classDef cache fill:#fff3e0,stroke:#ff9800,color:#000
    classDef process fill:#f3e5f5,stroke:#9c27b0,color:#000
    classDef decision fill:#666,stroke:#444,color:#fff
    classDef execution fill:#fce4ec,stroke:#e91e63,color:#000
    classDef result fill:#fff8e1,stroke:#ffc107,color:#000
    classDef deterministic fill:#c8e6c9,stroke:#4caf50,color:#000
    classDef nondeterministic fill:#ffcdd2,stroke:#f44336,color:#000

    %% Input and Initial Processing
    Input["🔤 User Input<br/>Natural Language Query"]:::input
    KVLookup{"🔍 Pattern<br/>Matching"}:::decision
    
    %% Cache Components
    CommandMap["📝 Command Map<br/>Pattern Store"]:::cache
    ContextTree["🌳 Context Tree<br/>State & History"]:::cache
    
    %% Deterministic vs Non-deterministic paths
    DeterministicPath["⚡ Direct Tool Selection<br/>Pattern-Guided"]:::deterministic
    NonDeterministicPath["🎲 Probabilistic Tool Selection<br/>LLM Analysis"]:::nondeterministic
    
    %% Execution Components
    ToolExecution["⚙️ Tool Execution<br/>gRPC Framework"]:::execution
    
    %% Success Handling
    SuccessCheck{"✓ Validation<br/>Check"}:::decision
    UpdateCache["📥 Update Cache<br/>Reinforce Pattern"]:::cache
    
    %% Result
    Result["🎯 Result<br/>Tool Output"]:::result

    %% Flow Connections with emphasis on determinism
    Input --> KVLookup
    
    %% Cache Hit - Deterministic Path
    KVLookup -->|Cache Hit| CommandMap
    CommandMap --> DeterministicPath
    ContextTree --> DeterministicPath
    DeterministicPath -->|High Confidence| ToolExecution
    
    %% Cache Miss - Less Deterministic Path
    KVLookup -->|Cache Miss| NonDeterministicPath
    NonDeterministicPath -->|Variable Confidence| ToolExecution
    
    %% Execution and Updates
    ToolExecution --> SuccessCheck
    SuccessCheck -->|Success| UpdateCache
    SuccessCheck -->|Failure| Result
    UpdateCache --> Result

    %% Logical Grouping
    subgraph Cache["🗄️ Cache Layer"]
        CommandMap
        ContextTree
    end

    %% Modern subgraph styling
    style Cache fill:#fff8e1,stroke:#ffa000,color:#000

    %% Edge styling
    linkStyle default stroke:#666,stroke-width:2
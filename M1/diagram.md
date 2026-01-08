```mermaid

sequenceDiagram
    actor H as Human
    participant A as Agent
    participant M as Model (LLM)

    A ->> H: Ask for input
    H -->> A: Input (vague question)
    A ->> M: invoke

    loop while clarification needed
        M -->> A: Use clarify tool
        create participant T as Tool (Clarify Tool)
        A ->> T: invoke tool
        T ->> H: Ask for clarification
        H -->> T: Clarification 
        T -->> A: tool result
        A ->> M: tool result
    end 

    M -->> A: Final result
    A ->> H: Final result

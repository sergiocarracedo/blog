I need you to research and write a comprehensive, educational blog post (approx. 12-minute read) targeting junior-to-mid-level software developers. The goal is to demystify the "AI Engineering Stack" by breaking it down into clear layers and explaining the specific purpose of each tool or standard.

**Critical Instruction for Meta-Analysis:**
As you perform this research, strictly log your process. I need a record of:
1. The specific search queries you used.
2. Which concepts were initially ambiguous and how you clarified them.
3. How you structured the information (e.g., did you change the outline based on findings?).
*I will ask for this "Search Journey" log after the blog post is written.*

### The Blog Post Requirements:

**Title Idea:** "From Chatbot to Coworker: Understanding the AI Dev Layers" (or similar)

**Tone:**
* Clear, "senior engineer mentor" vibe.
* Not too academic, but technically accurate.
* Avoid hype; focus on utility.

**Structure & Key Concepts to Cover:**

**Part 1: The Stack (The "What")**
Explain the hierarchy using a "Brain -> Hands -> Worker -> Manager" analogy or similar:
1.  **The Foundation (LLM):** Briefly explain this is just the raw intelligence (Claude 3.7, Gemini 1.5, GPT-4). It has no memory or hands yet.
2.  **The Context & Capabilities (Standards & Protocols):**
    * **MCP (Model Context Protocol):** Explain this as the "USB-C for AI"—a standard way for AIs to connect to data sources (Postgres, Slack, GitHub) without custom code.
    * **Context Files (`agents.md`):** Explain this as "README for Robots." It tells the AI *about* the project (rules, stack, conventions) so it doesn't hallucinate. (Source: agents.md).
    * **Skill Definitions (`skill.md`):** Explain this as "Training Modules." It tells the AI *how* to perform specific tasks (e.g., "How to run a migration"). (Source: agentskills.io).
    * *Key distinction:* `agents.md` is project context; `skill.md` is reusable capability.
3.  **The Worker (The Agent):**
    * Explain the "Agentic Loop": It doesn't just talk; it **Plans**, uses **Tools** (CLI, File edit), and **Debugs** its own mistakes.
    * Mention tools like **Cline** (formerly Roo Code) or **Windsurf** as examples of agents that live in your editor.
4.  **The Workspace (The Orchestrator):**
    * Explain that as agents get better, we stop just "chatting" and start "managing" them.
    * **Orchestrators:** Tools like **VibeKanban** (visualize agents working in parallel on a board) or **OpenDevin/AllHands**.
    * **The concept:** You assign a ticket to an agent, it creates a git worktree, tries to fix it, and requests review. You are the manager; the AI is the junior dev.

**Part 2: The Modes (The "How")**
Explain the different ways a dev interacts with these layers (referencing tools like Cursor/Windsurf/Cline):
1.  **Ask/Chat Mode:** "What does this function do?" (Context lookup).
2.  **Plan/Architect Mode:** "Read all these files and propose a refactor strategy." (Reasoning without editing).
3.  **Agent/Edit Mode:** "Implement the plan, run the tests, and fix errors until green." (Autonomous loop).

**Part 3: The Takeaway**
* How a junior dev should start: Don't jump straight to orchestrating 10 agents. Start with `Ask`, then master `Agent` mode in IDE, then look at `Orchestrators`.

**Research Verification:**
* Verify the current state/definition of `agents.md` vs `skill.md` to ensure the distinction is accurate.
* Verify `VibeKanban`'s specific workflow (git worktree isolation) as a prime example of orchestration.
---
title: "Introduction to an open-source framework to create AI multi-agent workflows: Bee Agent Framework"
date: 2025-02-02
draft: true
cover: bee-agents-framework.jpg
url: /bee-agent-framework-introduction
tags:  
  - ai
  - agent
  - framework
  - ibm
  - typescript
  - open-source
---

> The goal of this post is to introduce you the AI Agents and the Bee Agent Framework and how to create an agent a simple agent. 

Nowadays AI, and especially LLMs are everywhere, I guess you have heard about chatGPT, copilot, llama,  deepseek, etc.

Those models are very powerful, but you can "only" chat with them, ask them to write code, or search for information, but they can't act on your behalf, they can't interact with other systems, they can't do things for you.

That is where AI agents come into play. AI Agents are programs or systems that can act autonomously on behalf of the user or another system to perform tasks.

For example, Open AI just released (at the moment of writing this post) [Operator](https://operator.chatgpt.com/) which is a "*agent that can use its browser to perform tasks for you.*". [LangChain](https://www.langchain.com/) provides agents and an API to create new ones.

![agent-workflow](agent-workflow.svg)

**But how do agents work? How an agent can solve tasks?**, tasks can interact with other systems, for example navigate in internet (like OpenAI operator does), getting a file from your computer, using a CLI tool to convert a markdown to pdf, "see" and interacting with your desktop as Claude does, etc.

To do that, an agent has additional components that allow it to interact with the environment, those components are the **tools**. Tools extend the agent's capabilities to interact with the environment (external systems), get the information it needs to answer your question, or execute the task you ask for.

Imagine an agent who is in charge of organizing a trip for you, the rule of the agent is: if the travel day is rainy, use a train, if it is not, use a plane, it needs to check the weather forecast, it needs to interact with the internet to find the best flight or train, with your calendar to check if you are available, with your bank to pay for the tickets, etc. Those are the tools the agent needs to have to perform the task: A tool to check the forecast, a tool to navigate on internet on a flight/train search engine, a tool to check your calendar, a tool to interact with your bank and pay, a tool to save the flight information in your calendar, etc.

The agent provides the context to the LLM model about what tools do and how to ask for that, and depending on your question the LLM will decide to use one or another tool to solve the task and how to use it. For example, if you ask the agent to book a flight next Friday, the LLM "knows" that should use a tool to navigate on a flight search engine, and provide the origin, destination, and date to the tool to get the information it needs to answer your question. (or if you don´t give the destination ask you for it as it knows it needs it to use the flight search engine).


## Bee Agent Framework

Recently IBM released an open-source framework to create AI multi-agent workflows: [Bee Agent Framework](https://i-am-bee.github.io/bee-agent-framework/#/). It can work with multiple LLM providers (WatsonX, OpenIA, Azure OpenIA, Langchain, Groq, etc) but the most interesting provider is [Ollama](https://ollama.com/) that allows you to run multiple models to use like: llama, phi4, and the new one: deepseek-r1 is not able to call functions yet, but probably will be in the future.
It was written in Typescript and you can write tools and agents in Typescript or Javascript.


To illustrate how it works we will create an agent that can list and read the documents (.txt or .md files in a folder) and can save documents.

To do that we need to create a tool to list the folder files and read the documents and a tool to save files from a markdown.

Let start with the list tool:

```typescript
// src/tools/MyDocuments/MyDocumentsListTool.ts
import { ToolEmitter, Tool, ToolInput, JSONToolOutput } from "bee-agent-framework/tools/base";
import fs from 'node:fs'
import { z } from "zod";
import { Emitter } from "bee-agent-framework/emitter/emitter";
import { basename } from "node:path";

export class MyDocumentsListTool extends Tool<JSONToolOutput<string[]>> {
  name = "MyDocumentsListTool";
  description = "Returns the list of documents files names.";

  constructor(private folder: string) {
    super()
  }

  public readonly emitter: ToolEmitter<ToolInput<this>, JSONToolOutput<string[]>> = Emitter.root.child({
    namespace: ["tool", "MyDocuments"],
    creator: this,
  });

  inputSchema() {
    return z.object({
      filter: z.string().optional().describe(
        `A regex to filter documents by name`,
      ),
    })
  }

  static {
    this.register();
  }

  protected async _run(input: ToolInput<this>): Promise<JSONToolOutput<string[]>> {
    const filter = input.filter
 
    const regex = new RegExp(filter || '')

    const files = fs.readdirSync(this.folder).map(
      file => basename(file)).filter(file => !filter || regex.test(file)
    )

    return new JSONToolOutput(files);
  }
}
```
This tool is very simple, this code has nothing special (`_run` method) it returns the list of the file names in a folder (provided in the constructor) and filters them by a regex provided in the input. **That's all**, nothing related to AI, LLM, etc. Just a tool that returns a list of files.

The "magic" are is the ´description´ property and the ´inputSchema´ method, we describe what the tool does and what input it needs, and Bee framework will use that information to provide context to the LLM model. Then the LLM can decide to use this tool to solve a task or not depending on the user input.

We only need to register the tool (or tools in or agent) and the framework will take care of the rest.

```typescript
// src/agents/

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const documentsFolder = join(__dirname, '..', '..', 'documents')

const llm = new OllamaChatLLM();

const agent = new BeeAgent({
  llm,
  memory: new TokenMemory({ llm }),
  tools: [
    new MyDocumentsListTool(documentsFolder), 
    new MyDocumentsReadTool(documentsFolder), 
    new SaveFileTool(documentsFolder)],
    ...
});


const reader = createConsoleReader();
try {
    for await (const { prompt } of reader) {
      const response = await agent
        .run(
          { prompt },
          {
            execution: {
              maxRetriesPerStep: 3,
              totalMaxRetries: 10,
              maxIterations: 20,
            },
          },
        )
        .observe((emitter) => {
          emitter.on("error", ({ error }) => {
            reader.write(`Agent 🤖 : `, FrameworkError.ensure(error).dump());
          });
          emitter.on("retry", () => {
            reader.write(`Agent 🤖 : `, "retrying the action...");
          });
          emitter.on("update", async ({ data, update, meta }) => {
            // log 'data' to see the whole state
            // to log only valid runs (no errors), check if meta.success === true
            reader.write(`Agent (${update.key}) 🤖 : `, update.value);
          });
        });
  
      reader.write(`Agent 🤖 : `, response.result.text);
    }
  } catch (error) {
    logger.error(FrameworkError.ensure(error).dump());
  } finally {
    reader.close();
  }
```
That is the power of the Bee framework, you can create tools that extend the agent's capabilities to interact with the environment, and the LLM model can use them to solve tasks.

One interesting thing add "[guardrails](https://medium.com/towards-data-science/safeguarding-llms-with-guardrails-4f5d9f57cff2)" at tool level, not only at the model level, for example only giving access to a specific folder, or only allow to save files in a specific folder, controlling file access with the user ACLs, etc.

In the example agent the it interacts with the user via console, but you can create a web interface, anything you want.

## See it in action

To run the agent you need to:

- install [ollama](https://ollama.com/)
- clone this [github repository](https://github.com/sergiocarracedo/document-bee-agent-poc).
- install the dependencies: `pnpm install`
- and then run the agent: `pnpm start`

And now you can interact with the agent.
You can ask to create a new document, list the documents starting with a certain letter, read a document, etc.
Bee can also handle errors (check the last part of the video), retrying the action differently.

{{< youtube "38T35Zs-VMs" >}}

## Conclusion

Agents are a very powerful tool to make LLMs interact with the environment, and the Bee framework allows you to create them easily, and extend their capabilities with tools that can interact with the environment, to read a file, to call an API, to interact with a database, anything you can imagine.

This is just an introduction to the Bee framework where I just put the focus in a couple of aspects of the framework, but there are a lot of things to discover, like the memory system, the workflows, use different providers like OpenAI, WatsonX, etc. I you are interested on it, please let me know in the comments and I will write more about it.










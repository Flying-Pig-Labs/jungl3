> **What this is:** Third-party landscape memo on agentic innovation-sandbox platforms — sandboxes (Zurich, AWS Innovation Sandbox), multi-agent frameworks (NanoClaw, n8n, SwarmUI), research platforms (Epitome, AgentBench/WebArena), governance layers (Geordie AI, MCPJungle / MCP Gateway), and where the "unified loop" (ideation → swarms → DMZ → outpost) does and does not exist as a product.
> **Captured:** 2026-04-24.
> **What it argues:** No single vendor ships the end-to-end "jungle" — the category is an unbundled composition of sandbox layer + MCP gateway + behavioral-security layer + swarm execution + ideation engine; the closest analogs (MCPJungle, Epitome, Kraken's internal Finance OS) each cover only one slice.
> **Status:** Substantially overlaps with [`sideband-2026-04-22/02-innovation-sandbox-platform-landscape.md`](../sideband-2026-04-22/02-innovation-sandbox-platform-landscape.md) and [`docs/research/sideband-2026-04-22/SYNTHESIS.md`](../../research/sideband-2026-04-22/SYNTHESIS.md) §3 ("no single vendor ships the bundle"). Its "DMZ for beta users" framing reflects the *pre-2026-04-22* meaning of DMZ; current vocabulary splits that role into [DMZ (AI evaluation)](../../architecture/dmz.md) and [Canopy (human exposure)](../../architecture/canopy.md) per [ADR 0011](../../decisions/0011-canopy-and-ai-first-dmz.md). Naming collision note: the MCPJungle open-source project and "MCP Jungle" governance concept are unrelated to Jungl3; do not merge vocabularies.
> **How to read:** as independent corroboration that Jungl3 occupies a novel-category position. Claims about specific third-party tools are reference-grade, not decision-grade.

---

# **The Architecture of Autonomy: Evaluating the Convergence of Agentic Ecosystems and Innovation Sandboxes**

The rapid acceleration of artificial intelligence and the proliferation of autonomous agentic systems have catalyzed a shift in how organizations perceive product development and rapid experimentation. The conceptual framework of a multi-tenant “innovation jungle”—a system that integrates ideation, autonomous building, and production-like validation within isolated environments—represents the bleeding edge of platform engineering. This report provides a comprehensive analysis of the existing technological landscape, evaluating how close current systems come to fulfilling this vision, where the market gaps persist, and how disparate tools are beginning to coalesce into an unbundled yet coherent architecture.

## **The Evolution of the Innovation Sandbox: From Static Environments to the Autonomous Jungle**

The concept of an "innovation sandbox" has traditionally referred to a restricted, safe environment where developers can test new software without impacting the production systems. However, the proposed "jungle" framework radically expands this definition. It moves beyond the passive hosting of code to an active, agent-driven foundry that handles the entire lifecycle from signal detection in the "bazaar" to the deployment of "outposts" via synthetic "streams."

Historically, innovation sandboxes like those established by the city of Zurich have focused on regulatory compliance and safe data usage.1 These environments allow organizations to work closely on regulatory issues, particularly for high-stakes AI applications like computer vision or medical documentation.1 While these provide a "testbed," they lack the autonomous execution layers—the "swarms" and "ideation engines"—that characterize the "jungle" concept.

In contrast, modern enterprise-grade solutions like the Innovation Sandbox on AWS focus on departmental autonomy and cost governance.2 By automating account management and providing visibility into usage patterns, these platforms empower non-technical staff and students to leverage serverless apps and AI agents independently.2 This addresses the requirement for multi-tenant, isolated sandboxes, but the integration of an end-to-end "idea-to-prototype" workflow remains fragmented across different service providers.

## **Isolated Environments and the DMZ Pattern: Architectural Foundations**

A primary requirement of the conceptual system is that each team operates within an isolated sandbox containing both a production-like environment (DMZ) for external exposure and a development environment for rapid iteration. This architecture is essential for balancing the need for safety with the necessity of speed.

### **The Role of the DMZ in Agentic Testing**

In traditional network security, a DeMilitarized Zone (DMZ) acts as a buffer between the internal network and the public internet. In the "jungle" paradigm, the DMZ is repurposed as a "safe harbor" for beta users to interact with agent-generated prototypes. This requires sophisticated routing and isolation. Some modern implementations, such as "DMZ-as-a-Service" in the cloud, have sought to simplify this by externalizing the protection layer.3 However, misconfigurations in these cloud-based DMZs remain a significant risk, often leading to potential breaches.3

The "jungle" concept addresses this by proposing pre-configured, cloud-native infrastructure that is "API-first" and "AI-enabled." This implies that the sandbox is not just a container but an intelligent environment capable of self-healing and automated configuration.

### **Multi-Tenancy and Environment Cloning**

The ability to clone environments and reuse infrastructure patterns across teams is a hallmark of mature Platform Engineering toolkits. The AWS Innovation Sandbox facilitates this through "recyclable" sandbox management, allowing for the rapid creation and teardown of environments.2 This capability is crucial for the "jungle" where teams must be able to branch off existing successful architectures to experiment with new features.

| Feature | Zurich AI Sandbox | AWS Innovation Sandbox | Conceptual "Jungle" |
| :---- | :---- | :---- | :---- |
| **Primary Goal** | Regulatory/Data Safety 1 | Efficiency/Education 2 | Rapid experimentation/deployment |
| **Isolation Mechanism** | Organizational/Regulatory 1 | Automated AWS Accounts 2 | Multi-tenant isolated sandboxes |
| **Infrastructure** | Task-specific (e.g., Smart Parking) 1 | General Cloud (Serverless/AI) 2 | Pre-configured, agent-aware |
| **External Exposure** | Highly Restricted 1 | Managed/Self-service 2 | Integrated DMZ for beta users |

## **Agent-Driven Architecture and the "Swarm" Execution Layer**

The most transformative aspect of the "jungle" is the move toward autonomous or semi-autonomous system building via AI agents. This involves two core components: "agent-driven architecture generation" and "swarms" of multi-agent builders.

### **Swarms and Multi-Agent Orchestration**

The "jungle" envisions swarms that take ideas and construct working prototypes. This is no longer purely theoretical. Frameworks like NanoClaw already support "agent swarms," which are coordinated multi-agent pipelines where specialized agents handle scraping, research, analysis, and presentation in sequence.5 Unlike monolithic agents, these swarms are modular, allowing for a "divide and conquer" approach to software building.

Further evidence of this trend is found in SwarmUI, an open-source tool that simplifies the use of complex AI generation workflows.6 SwarmUI auto-generates well-made "Comfy" workflows, teaching users how to use these systems without creating "frankenstein noodle" nightmares—a term used to describe overly complex and unmanageable node-based configurations.6

### **The "Frankenstein" Starter App Paradigm**

The request identifies a need for "Frankenstein" starter apps—prebuilt applications with working integrations that can be trimmed down. This reflects a shift in the MVP philosophy. Instead of building from scratch, developers are encouraged to "think like Frankenstein," stitching together existing modules to quickly validate a product.7

However, industry experts warn that this approach can lead to significant "tech debt." Specode, for example, advocates for building from "reusable, compliant blocks" rather than creating a "Frankenstein codebase".8 The challenge for the "jungle" is to provide starter apps that are modular enough to be "trimmed down" without becoming the "software plugged into itself" monster described by critics of legacy agentic codebases.5

### **Case Study: Kraken’s AI-Native Finance Operating System**

Kraken’s Global Finance team provides a real-world example of the "builder swarm" in action. They have tasked "Solutions Architects" with designing and deploying agentic AI systems that move from "discovery to design to build to deployment to optimization".9 This role is essentially a "jungle guide," overseeing how agentic systems interact with financial infrastructure and data pipelines.9 This implementation demonstrates that while full autonomy is the goal, current production-grade systems still require a sophisticated "architect" to oversee the swarm.

## **The Marketplace Layer: Bazaar Scanning and the Rope Swing Engine**

The "bazaar" and the "rope swing" represent the intelligence and ideation layer of the system. This layer must scan external signals (the bazaar) and synthesize them into actionable ideas (the rope swing).

### **Trend Detection and Internet Scraping**

The marketplace layer must continuously scan for signals. Current tools like AgentBench and WebArena are pushing the boundaries of how agents interact with the "digital landscape".10 WebArena, in particular, recreates fully functional websites across e-commerce, social forums, and software development, challenging agents to complete multi-step tasks a human might perform online.10

The success rate of these agents is a critical metric for the "bazaar." In current evaluations, GPT-4 based agents achieve only a ![][image1] success rate on complex web tasks, compared to ![][image2] for humans.10 This suggests that while the "bazaar" can scan for signals, the "scoring" and "idea generation" components of the rope swing are still heavily reliant on human-AI collaboration.

### **Deep Research and the Epitome Platform**

The "rope swing" engine requires capabilities similar to the Epitome platform. Epitome is the world's first open experimental platform dedicated to the deep integration of AI and social science.11 It allows researchers to design complex experimental scenarios—such as AI-human cooperation and ethical dilemmas—by offering a comprehensive solution spanning "foundation models—complex application development—user feedback".11

The relevance of Epitome to the "jungle" concept lies in its "seven core modules" and "canvas-style" interface, which facilitate systematic investigations into the social impacts of AI.12 For a "jungle" ideation engine, this level of research and synthesis is necessary to ensure that generated product ideas are not just technically feasible but socially and commercially viable.

## **Synthetic Data, Traffic Simulation, and the "Streams" Data Fabric**

A sophisticated innovation sandbox requires more than just code; it requires a high-fidelity data environment. The "streams" in the conceptual system represent synthetic data pipelines and system replicas.

### **Mimicking Real-World Usage**

The importance of synthetic data is highlighted in the Zurich Innovation Sandbox, where the use of novel and anonymized data sources is essential for testing AI projects like smart parking.1 By using low-resolution images and "privacy-by-design" measures, they ensure that the data streams mimic real-world occupancy without violating data protection laws.1

In a broader "jungle" context, these streams must support "optional traffic simulation" to create the illusion of live production load. This allows teams to test how their "outposts" (deployments) behave under stress. While some synthetic data platforms exist, few are integrated directly into an "ideation-to-deployment" workflow.

### **Visual Topology and Connectivity**

The request for a "visual or conceptual topology" where core environments, outposts, and user access are connected via deployment pathways is a key requirement for managing the "jungle." This mirrors the need for visibility in complex agentic systems. Platforms like Geordie AI provide "end-to-end agent visibility," establishing a unified view across different architectures to identify and manage all AI agents within an enterprise as assets.15 This visibility is crucial for understanding how data flows from the "streams" to the "outposts."

## **Governance, Security, and the "MCP Jungle"**

As organizations scale their use of AI agents, they encounter a phenomenon known as the "MCP Jungle." This refers to the fragmentation and lack of control that occurs when an enterprise rapidly adopts the Model Context Protocol (MCP) without a central control plane.17

### **The MCP Gateway as a Central Control Plane**

The Model Context Protocol has emerged as a standard for exposing tools and data to AI agents, but it alone is not enough for enterprise-grade operations.17 This gap has led to the development of "MCP Gateways." An MCP Gateway, such as the one open-sourced by IBM, sits between AI agents and MCP servers to provide tool aggregation, access control, and policy enforcement.17

| Capability | Model Context Protocol (MCP) | MCP Gateway (e.g., MCPJungle) |
| :---- | :---- | :---- |
| **Standardization** | Standardizes how agents talk to tools 17 | Operationalizes interactions for the enterprise 17 |
| **Tool Management** | Often tightly coupled to specific platforms 17 | Provides "Runtime Tool Discovery" (no rebuilds needed) 17 |
| **Security** | Fragmented authentication/authorization 17 | Centralized governance and subscription-based access 17 |
| **Observability** | Little visibility into tool usage 17 | Centralized logging and monitoring of tool performance 17 |
| **System Protection** | Uncontrolled agents can overwhelm backends 17 | Enforces rate limiting and throttling 17 |

The open-source project **MCPJungle** acts as a centralized hub for private AI agents, allowing developers to register multiple MCP servers and tools in one place.17 This project exemplifies the "centralized control plane" required for the conceptual "jungle," providing "Enterprise Mode" security and access control.17

### **Behavioral Oversight and Geordie AI**

A critical failure point in traditional security is its inability to govern the non-deterministic behavior of AI agents. Geordie AI addresses this through a "Behavioral Layer" of security.16 Their proprietary "Beam" engine translates insights into real-time mitigation, moving beyond simple detection to proactive "context engineering".16

This is particularly relevant for the "jungle" because agents can produce unsafe outcomes even without a system breach.16 Geordie identifies agent-native risks like "inference drift" (decisions shaped by poisoned memory), "tool impersonation," and "silent failures" (agents reporting success despite skipping steps).16 This level of oversight is necessary for a sandbox that allows "swarms" to autonomously deploy code in a DMZ.

## **Market Gap Analysis: Is the "Jungle" a Single System or an Unbundled Future?**

The research indicates that no single platform currently combines all the requested features—ideation, research, swarm building, synthetic streaming, and production-like deployment—into a unified "jungle." Instead, the concept represents an "emerging convergence" of several distinct categories.

### **Comparison of Capabilities Across Categories**

| Category | Representative Tools | Key Strengths | Missing Links |
| :---- | :---- | :---- | :---- |
| **Innovation Sandboxes** | AWS Innovation Sandbox 2, Zurich AI Sandbox 1 | Secure isolation, multi-tenancy, regulatory alignment. | Lack autonomous builders (swarms) and research engines (rope swing). |
| **Agentic Frameworks** | LangChain, CrewAI, n8n 18 | Workflow automation, tool integration, multi-agent orchestration. | Lack integrated production-like DMZ and synthetic traffic streams. |
| **Research Platforms** | Epitome 11, AgentBench 10 | Deep research, social science integration, agent evaluation. | Lack automated deployment and infrastructure cloning. |
| **Governance Platforms** | Geordie AI 15, MCPJungle 17 | Behavioral monitoring, tool aggregation, security gating. | Lack the "bazaar" (trend scanning) and idea ranking mechanisms. |
| **Low-Code/UI Builders** | SwarmUI 6, Specode 8 | Rapid UI/workflow generation, reusable blocks. | Lack deep research synthesis and isolated multi-tenant management. |

### **Identifying the Market Gaps**

1. **The "Unified Loop" (Ideation to Deployment):** There is a clear gap in systems that can autonomously transition from a research-backed "idea" in the bazaar to a functional "prototype" in a swarm, and finally to a validated "outpost" in the DMZ. Currently, these phases are managed by separate tools and manual transitions.  
2. **Autonomous Architecture Generation:** While agents can generate code, the ability for an agent to "propose and optionally deploy full-stack applications" including the necessary cloud infrastructure (Azure, AWS) in a self-service manner is still in the "early-stage" of maturity.  
3. **Integrated Synthetic Feedback:** While synthetic data exists, integrating it with a "community voting" mechanism and a "research engine" to score and refine ideas is an unfulfilled requirement.

## **Strategic Archetypes: Enterprise, Startup, and Open-Source Analogs**

The following examples represent the closest approximations of the "jungle" in various sectors.

### **Enterprise Implementation: Kraken’s Finance OS**

Kraken is building an AI-native operating system for finance that spans from "discovery to optimization".9 Their focus on "audit integrity" and "SOX-regulated environments" matches the requirement for enterprise-grade, isolated experimentation.9 However, this is a bespoke internal tool rather than a platform available to external teams.

### **Startup Implementation: Geordie AI and Dropzone AI**

Startups like Geordie AI and Dropzone AI are focusing on the "governance" and "operational" layers of the jungle. Dropzone AI uses multi-agent systems to mimic expert analysts for end-to-end investigations.19 Geordie AI provides the "end-to-end visibility" and "posture management" required for a multi-tenant sandbox.16 These startups are building the "guardrails" that will eventually enable the more autonomous "builder" layers.

### **Open-Source Ecosystem: Composeable Foundations**

The most likely path to a full "jungle" implementation is through the composition of open-source tools.

* **Orchestration:** n8n provides templates for "AI teams" and workflows for scraping and content generation.18  
* **Infrastructure:** MCPJungle and other MCP gateways provide the central hub for tool and data access.17  
* **UI/Workflows:** SwarmUI and NanoClaw offer modular, agent-friendly builders.5  
* **Research:** Epitome provides the methodology for human-AI interaction experiments.11

## **Architectural Constraints and Failure Points**

Implementing the "jungle" concept is fraught with technical and operational challenges.

### **The Problem of "Inference Drift" and "Context Manipulation"**

As agents operate over time and across systems, they are susceptible to "inference drift"—decisions shaped by contaminated context or poisoned memory.16 In a multi-tenant sandbox, this could lead to cross-contamination of ideas or security breaches. The solution, as proposed by Geordie AI, is "context engineering" that provides agents with specific, policy-aligned context in real-time.16

### **Complexity and "Noodle" Nightmares**

The "Frankenstein" metaphor is not just about code; it's about the complexity of the orchestration itself. Developers have noted that some agentic systems result in "nightmares" of custom node packs and unmanageable dependencies.5 To avoid this, a "jungle" must prioritize "lightweight, modular" architectures that AI coding agents can customize directly without creating massive tech debt.5

### **The Cold-Start and Latency Problem**

In an environment with hundreds of registered tools and servers, latency becomes a significant issue. MCPJungle addresses this through "stateful connections" to avoid "cold-start" overhead, maintaining an open connection to the MCP server for subsequent tool calls.17 This is critical for a "rapid iteration" sandbox where developer and agent performance must remain high.

## **Conclusion: The Unbundled Future System**

The research demonstrates that the "jungle" concept represents an **emerging convergence of existing categories** rather than a single established product. While parts of the system exist—such as the isolated sandboxes of AWS, the governance layers of Geordie AI, and the multi-agent swarms of NanoClaw—they are not yet unified into a single, seamless platform.

The closest existing analogs, such as the **MCPJungle** gateway and the **Epitome** research platform, satisfy the "plumbing" and "intelligence" requirements but fall short of the "end-to-end building and deployment" capabilities. The market is currently in a state of **fragmented maturity**, where enterprise-grade isolation is common, but autonomous building and integrated trend-scanning are still in early-stage development.

For an organization to realize the "jungle" vision today, it would need to compose a system from the following building blocks:

* **Sandbox Layer:** AWS or Azure multi-tenant account management.  
* **Control Plane:** An MCP Gateway like MCPJungle for tool management.  
* **Security Layer:** Behavioral oversight via Geordie AI.  
* **Execution Layer:** Swarms built on NanoClaw or n8n.  
* **Ideation Layer:** Custom scrapers integrated with a research-focused LLM framework like Epitome.

The "jungle" is an unbundled future system that will likely coalesce as the Model Context Protocol matures and as agentic security systems become more adept at governing non-deterministic builder swarms. The ultimate goal is a system where the "rope swing" of ideation and the "swarms" of building operate in a continuous, self-improving loop, governed by a "behavioral layer" that ensures innovation does not descend into chaos.

#### **Works cited**

1. Innovation-Sandbox for AI | Innovation Zurich, accessed April 23, 2026, [https://innovation.zuerich/en/sandbox/](https://innovation.zuerich/en/sandbox/)  
2. Empowering educators: How Innovation Sandbox on AWS accelerates learning objectives through secure, cost-effective, and recyclable sandbox management | AWS Public Sector Blog, accessed April 23, 2026, [https://aws.amazon.com/blogs/publicsector/empowering-educators-how-innovation-sandbox-on-aws-accelerates-learning-objectives-through-secure-cost-effective-and-recyclable-sandbox-management/](https://aws.amazon.com/blogs/publicsector/empowering-educators-how-innovation-sandbox-on-aws-accelerates-learning-objectives-through-secure-cost-effective-and-recyclable-sandbox-management/)  
3. Hacking | Cyberhades, accessed April 23, 2026, [https://www.cyberhades.com/categories/hacking](https://www.cyberhades.com/categories/hacking)  
4. Videos | Cyberhades, accessed April 23, 2026, [https://www.cyberhades.com/categories/videos](https://www.cyberhades.com/categories/videos)  
5. 16 Best OpenClaw Alternatives 2026 (Tested \+ NemoClaw Review) \- Taskade, accessed April 23, 2026, [https://www.taskade.com/blog/best-openclaw-alternatives](https://www.taskade.com/blog/best-openclaw-alternatives)  
6. SwarmUI 0.9.7 Release : r/StableDiffusion \- Reddit, accessed April 23, 2026, [https://www.reddit.com/r/StableDiffusion/comments/1mzsc62/swarmui\_097\_release/](https://www.reddit.com/r/StableDiffusion/comments/1mzsc62/swarmui_097_release/)  
7. Sitemap \- SoftwareSeni, accessed April 23, 2026, [https://www.softwareseni.com/sitemap/](https://www.softwareseni.com/sitemap/)  
8. Accelerating Pharma's Digital Health Journey with Specode, accessed April 23, 2026, [https://www.specode.ai/blog/digital-health-for-pharma](https://www.specode.ai/blog/digital-health-for-pharma)  
9. Kraken AI Agents Solutions Architect | Welcome to the Jungle (formerly Otta), accessed April 23, 2026, [https://app.welcometothejungle.com/jobs/f5h1cXl6](https://app.welcometothejungle.com/jobs/f5h1cXl6)  
10. Autonomous Agent Frameworks \- SmythOS, accessed April 23, 2026, [https://smythos.com/developers/agent-development/autonomous-agent-frameworks/](https://smythos.com/developers/agent-development/autonomous-agent-frameworks/)  
11. Epitome: Pioneering an Experimental Platform for AI-Social Science Integration \- arXiv, accessed April 23, 2026, [https://arxiv.org/html/2507.01061v2](https://arxiv.org/html/2507.01061v2)  
12. Epitome: Pioneering an Experimental Platform for AI-Social Science Integration \- arXiv, accessed April 23, 2026, [https://arxiv.org/html/2507.01061v1](https://arxiv.org/html/2507.01061v1)  
13. Epitome: Pioneering an Experimental Platform for AI-Social Science Integration, accessed April 23, 2026, [http://paperreading.club/page?id=320781](http://paperreading.club/page?id=320781)  
14. AI can help in the 5 different phases of design \- ResearchGate, accessed April 23, 2026, [https://www.researchgate.net/figure/AI-can-help-in-the-5-different-phases-of-design\_fig1\_390340046](https://www.researchgate.net/figure/AI-can-help-in-the-5-different-phases-of-design_fig1_390340046)  
15. RSAC 2026 Innovation Sandbox | Geordie AI: Architect of Enterprise AI Agent Security Governance Systems, accessed April 23, 2026, [https://securityboulevard.com/2026/03/rsac-2026-innovation-sandbox-geordie-ai-architect-of-enterprise-ai-agent-security-governance-systems/](https://securityboulevard.com/2026/03/rsac-2026-innovation-sandbox-geordie-ai-architect-of-enterprise-ai-agent-security-governance-systems/)  
16. AI Agent Security Platform for Enterprises | Geordie AI, accessed April 23, 2026, [https://www.geordie.ai/product](https://www.geordie.ai/product)  
17. Taming the MCP Jungle: Why Enterprises Need an MCP Gateway ..., accessed April 23, 2026, [https://medium.com/@anand.awasthi/taming-the-mcp-jungle-why-enterprises-need-an-mcp-gateway-7ad04611baa9](https://medium.com/@anand.awasthi/taming-the-mcp-jungle-why-enterprises-need-an-mcp-gateway-7ad04611baa9)  
18. Build AI Teams in n8n: Free Template | PDF | Artificial Intelligence \- Scribd, accessed April 23, 2026, [https://www.scribd.com/document/944798664/204-n8n-templates-1-1](https://www.scribd.com/document/944798664/204-n8n-templates-1-1)  
19. Dropzone AI: Funding, Team & Investors | Startup Intros, accessed April 23, 2026, [https://startupintros.com/orgs/dropzone-ai](https://startupintros.com/orgs/dropzone-ai)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAXCAYAAABXlyyHAAACTElEQVR4Xu2Xz0sVURTHjymYii6kNv4BLtq50E2ulBYRUeLKFlEIikph4MqlBBEF1bKolUiLXPkv2K6gWoTgwoW/f4EmgqllnS/3nt6Z8+68mXnPRQ/mA1/mnnPvvDvfO3fOzCPKyflfucWqsUlDj01UI82sP6wO1g7rTrT7H3OsVzYZYoI1YpMxHLD6bTIFdeQuuhRbNuE5Zt1XMX4HesK6xnrs4zM1poj3rBMqnDwa7Q4yTG5sOYZx0SHDX6lwDaF+gHyTiYU2f1xkNap8SdIaxnYqx/Aka5niDQFsx7h+m/9t4m5KuZWFNIb3/TGr4VpyZmep+MI1SYYvm1hjFyCRJMN3Wfd8O6vhI3+sxDAW7I1vX2LNqL4lyrCVhSTDKFRCFsMPWLd9uxLDAAXpA0XvZi/rhYpTg4nGbNKDyqnffVkMb6t2pYZDaPOtrE3WN5WLBRPhblhusB6aXFrD8swL520Y27xBxfrcU9UOgsHWGJDnT5PG8AAVnnnhPA1fZz1T8TRFH7u3lPBFhonGbZKZN/pMbuyCj+PAB4E9V97DEluyGP5l4p+s7ypG3ehScRGY6JFNBmin8B2+SPE1QFin0obSGl5j1Zsc6ow23MfqVHEElHlM9Nx2BLhKbuyQySMHXTF5zQ8qbegjuX5rRnOTNWWTzFPWoYrfUWBLo8Tjy2mVteKPWCl8bobYI7e6MhaxgH8xn1SseUnud2WeDXLbW0CdQHWVfsyxyxpUYwR9ngWLJSbjPFQVr1kXbFLRQq5wfbEdOTk5OVXFX2srr6B5LwGnAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAXCAYAAABXlyyHAAACrElEQVR4Xu2Xy8tNURjGX5I7A5cJ0RdKbgMDBmJCBgZC7spATORPQElKMpBkQBS5TBRlKiMKCQkTCblFlIhy53lae53z7uestff5Zk7tXz19+33WZe/3rHevvT6zhob/lRXQADWFxWr0IqOgv9Bc6D20qdzc4jJ0WM3IfegmtAPaDG2ENkDrC3n2WLjhb2hXuamSydBzC2MfQKNLrWnuQEfE+w5tcTHno/ZDS6F9RfzH9ekgDkrpo+t31cplshP65OIcq6EbLn5mYW6WZY45FvpowvRGSByZUPx9DA13fgcctAiaBU2DphTykw2E3rk4wj4T1RTYZ23C8/MrXKFcwh5WmmehVZRyhKWjcEVmu3ildd6M0OtTU0glx/eP3gzxyS0LJZ9LeLzEHv0BumIBdEE8llF88KmFx4fVG6bYbmFP8PBd5Fh9l6dDp4rrVMIvoOPF9TjonGt7ajWlnCOXxCVrJ30X+lJu7hepVSfeSyVMWO5cEL+aS6BDLu6a04VyPLT2w1LcXPrLUQtjuZqeKxZWLZJLOIVPfgz01sLXpxbepE/Ngq/W3ny4E8akR7Z61DPWwpj54nOHvShetwmzzIe52FfJT3fdwTZLlxk5C10Xjzsi+z8SPwdPRuw/SRssfd9uEl4GHXTxGeizi09YxYksrloK+nGz8uy2/BiF/fw3dKu157yWEPu/Ka5zm9Evib9ZeQH4ddFqahFLNAX9NWpaqIonLh5q4cSm8EEGiVdXGXUr/BoaIh7PCn7eVdA8F5eoSnidpdvoDZaYmuk8vmPRV+XgO8n289pQsBzaqyY4YOWvx0mrKGneQEvEwzMs+3BC9uO131UJj4u3xdMk6xLmO8jVewm9gj5Y+KfBw+94Ds4bk/zhG3qVYxaOujl4mOGPdk8bGhoaGnqKf5kAxsLPgtwQAAAAAElFTkSuQmCC>
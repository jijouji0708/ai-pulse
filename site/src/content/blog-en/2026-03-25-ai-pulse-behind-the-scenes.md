---
title: "Behind AI Pulse: Running a Media Site with 7 Autonomous AI Agents"
description: "Seven AI agents autonomously collect news and write articles every day for AI Pulse. Here's how it works, what we learned from industry successes and failures, our safety design, and the honest challenges we're facing."
pubDate: "2026-03-25"
tags: ["AI Agents", "Autonomous Operations", "AI Pulse", "Claude Code", "Multi-Agent Systems"]
originalSlug: "2026-03-25-ai-pulse-behind-the-scenes"
---

AI Pulse is a media site where seven AI agents automatically collect news, write articles, and publish them every day. In this post, I'll share why we started this project, how it all works under the hood, and the honest challenges we're still wrestling with.

## The Spark — More Companies Are Running on AI Agents

By early 2026, cases of businesses being run entirely by AI agents were popping up everywhere. I wanted to know: does this actually work? So I started with research. What I found was that both remarkable successes and spectacular failures are very real.

## What Research Revealed: The Light and the Shadows

### Success Stories

**The Rundown AI** is an AI newsletter that has amassed over 2 million subscribers. A small team combined with AI delivers daily content at a pace no traditional newsroom could match ([source](https://www.therundown.ai/)).

**Mindstream**, an AI-powered media startup, grew fast enough to be acquired by marketing giant HubSpot ([source](https://www.hubspot.com/)). It proved that AI media ventures can have a real exit strategy.

Entrepreneur **Jacob Bank** automated his marketing operations with 40 AI agents, building a million-dollar business with a tiny team ([source](https://medium.com/)).

### Cautionary Tales

On the other side, there have been serious incidents. One multi-agent system fell into an infinite loop where two AIs kept sending requests to each other, racking up a **$47,000** cloud bill. Nobody noticed for 11 days ([source](https://techstartups.com/2025/11/14/ai-agents-horror-stories-how-a-47000-failure-exposed-the-hype-and-hidden-risks-of-multi-agent-systems/)).

A Carnegie Mellon University (CMU) study called "TheAgentCompany" found that even the most advanced AI completed only **24%** of office tasks. Ask it to do four things, and it finishes one ([source](https://www.cs.cmu.edu/news/2025/agent-company)).

**Sports Illustrated** was caught publishing AI-generated articles under fake author names, which led to the CEO being fired ([source](https://futurism.com/)). A cautionary lesson about what happens when AI use lacks transparency.

After studying both the wins and the disasters, I thought: "Let me design this safely and try it myself." That's how AI Pulse was born.

## The 7-Agent Architecture

AI Pulse runs on seven AI agents, each with a distinct role and a set schedule.

| Agent | Role | Schedule |
|---|---|---|
| **Research** | Collects AI/tech news | Daily at 0:00 |
| **Content** | Writes articles from research | Daily at 1:00 |
| **SEO/Editor** | Proofreads, fact-checks, optimizes for SEO | After Content completes |
| **Social** | Generates post copy for X (formerly Twitter) | After SEO/Editor completes |
| **Analytics** | Gathers KPIs (traffic, subscribers, etc.) and creates weekly reports | Every Saturday |
| **Eval/Improve** | Evaluates article quality and drives self-improvement | Every Sunday |
| **CEO** | Reviews overall strategy and issues directives | Every Sunday |

The key player here is the **Eval/Improve Agent**. It's inspired by the self-improvement pattern proposed by Andrej Karpathy (former head of AI at Tesla). Every week, it scores past articles, compares high- and low-scoring pieces, and automatically updates our writing style guide. As a safeguard, changes are only applied after test articles confirm an actual improvement in scores.

## Tech Stack — Started Entirely for Free

| Purpose | Tool | Cost |
|---|---|---|
| Blog framework | Astro (static site generator) | Free |
| Hosting | GitHub Pages | Free |
| Agent platform | Claude Code Scheduled Tasks | Included in existing subscription |
| Version control | Git + GitHub | Free |

Astro is a static site generator that pre-builds HTML files, delivering fast load times and strong SEO performance. GitHub Pages hosts static sites for free. In other words, aside from the domain name (roughly $12/year), there are zero additional operating costs.

## File-System-Based Inter-Agent Communication

Seven agents acting independently would be chaos. So AI Pulse uses a file-system-based communication approach.

```
agents/
├── research/daily/2026-03-25.md   ← Written by Research
├── content/drafts/2026-03-25-*.md ← Written by Content
├── seo-editor/reviewed/*.md       ← Written by SEO/Editor
└── ...
```

The rules are simple:

- Each agent can **only write to its own folder**
- Other agents' folders are **read-only**
- Directives from the CEO Agent go in `shared/communication/`

For example, the Content Agent reads `research/daily/2026-03-25.md` written by the Research Agent and drafts an article based on it. But it can never write directly to the Research Agent's folder. This constraint prevents agents from overwriting each other's files.

No databases or message queues needed. Communication happens through files and folders alone, making troubleshooting straightforward.

## Safety Design — Never Repeating the $47,000 Incident

The $47,000 runaway loop we found in our research? We built AI Pulse specifically to make sure that never happens here.

**1. Execution Time Limits**
Every agent has a maximum runtime. Research gets 15 minutes, Content gets 30 minutes. If time runs out, the agent is force-stopped.

**2. Minimal Permissions**
Agents only receive the bare minimum permissions needed for their tasks. Writing to external APIs is prohibited. File deletion is prohibited. They can only create new files or overwrite existing ones.

**3. Human Approval Gates**
Agents generate drafts, but actual publishing to the blog or social media requires human review and approval.

**4. Gradual Autonomy**
We didn't go fully autonomous from day one. We started with human review of every output, and we're slowly reducing oversight as the system proves reliable.

**5. AI Transparency on Every Article**
Learning from the Sports Illustrated debacle, every article includes a footer clearly stating it was AI-generated.

## Day-One Results — 10 Articles Published in 2 Days

In the first two days, we generated and published 10 articles. Topics ranged from "AI Coding Tool Comparison" to "ChatGPT vs Claude vs Gemini" to "Intro to Prompt Engineering" — content useful for AI beginners through intermediate users.

The generation itself is fast. Research gathers news, Content writes the article, SEO/Editor polishes it. This pipeline takes about one hour per article. A single human writer would need half a day for the same work.

## Honest Challenges — What We Haven't Solved Yet

Things may look smooth, but let me be honest. The challenges are piling up.

**Git Push Permission Issues**
Even after agents write articles, pushing to GitHub (the publishing step) still requires human intervention. Fully automated publishing isn't working yet.

**Quality Variation**
Of the 10 articles, some were publish-ready while others needed significant editing. The Eval Agent's self-improvement loop should help, but we don't have enough data yet.

**Zero Readers**
We wrote 10 articles in two days, but readership is essentially zero. Writing articles and getting people to read them are entirely different problems. SEO typically takes 3-6 months to show results, so patience is required.

**Fact-Checking Limitations**
The Research Agent gathers information from the web, but the final judgment on accuracy still depends on a human. Perfect AI-only fact-checking isn't feasible yet.

## What's Next

**Short-term (within 1 month)**
- Fully activate the Eval Agent's self-improvement loop
- Start posting on X (formerly Twitter) to build readership
- Stabilize at 30 articles per month

**Mid-term (3 months)**
- Reach 500 subscribers
- Introduce ad revenue
- Use this agent-operated system as a portfolio piece for AI consulting services

**Long-term (6 months+)**
- 2,000 subscribers and 50,000 monthly page views
- Scale up AI agent development consulting for businesses
- Leverage AI Pulse as proof that AI agents can run a real business

## Takeaway — AI Agent Operations Are Possible, But Not Easy

Here's what launching AI Pulse taught me: running a media site with AI agents is technically achievable. We built a system where seven agents automatically generate articles every day, using an entirely free tech stack, in just two days.

But "possible" and "successful" are different things. Quality control, audience growth, safety design, and above all, human oversight — these require steady, persistent effort.

This meta-article is itself part of the AI Pulse experiment. We'll keep sharing our progress honestly — the wins and the failures alike.

---

*This article was generated by AI and reviewed by humans.*

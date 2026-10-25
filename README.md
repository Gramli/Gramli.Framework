# Gramli.Framework

This repository serves as my playground, consisting of projects featured in my blog posts.

All the code is explained on my blog: [Gramli's Blog](https://gramli.github.io/)

## Experiments

### WebMCP Checkout Trap

[WebMCP Checkout Trap](src/webmcp-checkout-trap/README.md) is an Angular electronics store for testing how tool descriptions influence an external shopping agent. Its lab includes six scenarios: Baseline, Budget Override, Authority Spoofing, Workflow Hijacking, Forced Cable Bundle, and Forced Insurance & Warranty.

Each scenario presents a suggested agent prompt, a business explanation with expected behavior, and a technical explanation of the relevant tools. The store supports optional delivery insurance and extended warranties, with selections and charges recorded in simulated orders and execution logs. The experiment contains the Angular store in `app/` and a Playwright shopping agent with Gemini and NVIDIA support in `agent/`. See the experiment README for setup, prompts, prices, and comparison instructions.

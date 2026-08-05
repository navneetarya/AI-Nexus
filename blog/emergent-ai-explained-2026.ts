// blog/emergent-ai-explained-2026.ts
// Target keyword: "emergent ai" — low-medium volume, low competition, rising term
// Secondary keywords: "emergent abilities in ai", "emergent behavior ai agents", "is emergent ai real", "ai capability jump"
// Intent: informational — pillar/explainer post, no product being reviewed
// Angle: honest explainer covering both the "emergent abilities" research claim and the 2023 Stanford "mirage" rebuttal,
//   then pivots to practical implications for tool users and multi-agent workflows
// Internal links: /best-ai-productivity-tools/, /blog/multi-agent-ai-systems-explained-2026,
//   /blog/what-is-mcp-model-context-protocol-2026, /blog/ai-agents-vs-ai-automation-difference-2026, /blog/best-ai-chatbot-2026
// Word count: ~3,000 words | Published: 2026-07-23 | Author: Navneet Arya

import { BlogPost } from './types';

const post: BlogPost = {
  slug: 'emergent-ai-explained-2026',
  title: 'What Is Emergent AI? Emergent Abilities Explained (2026 Guide)',
  seoTitle: 'What Is Emergent AI? Emergent Abilities Explained 2026',
  metaDescription: 'Emergent AI explained in plain English — real examples, the "mirage" research debate, and what emergent behavior in AI agents means for your workflow in 2026.',
  datePublished: '2026-07-23',
  dateModified: '2026-07-23',
  author: 'Navneet Arya',
  category: 'Productivity',
  readTime: '12 min read',
  ogImage: 'https://ainexustools.online/og/blog/emergent-ai-explained-2026.webp',
  excerpt: 'Emergent AI describes capabilities, like multi-step reasoning or in-context learning, that show up suddenly in larger models without being explicitly trained in. These capabilities do not exist at all in smaller versions of the same model. It is a real, actively debated research phenomenon, not just a marketing term. Understanding it explains why your AI tool\u2019s next update might suddenly get much better, or start doing things you did not ask for.',
  content: `<p>Type the same prompt into a small AI model and a large one. Sometimes you get more than "a better answer." You get an ability that simply wasn't there before. That jump has a name: emergent AI. I'm Navneet Arya, and I've spent this year watching model releases add capabilities nobody explicitly trained them to have. This guide explains what that actually means, whether it's real, and why it matters even if you never read a research paper.</p>
<!-- ai-nexus:early-comparison-table -->
<div style="overflow-x:auto;margin:16px 0 24px;">
<table style="width:100%;border-collapse:collapse;font-size:14px;">
  <thead><tr style="background:rgba(13,148,136,.1);">
    <th style="padding:10px 14px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Quick Comparison</th>
    <th style="padding:10px 14px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">What To Check First</th>
  </tr></thead>
  <tbody>
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid rgba(13,148,136,.08);">Best-fit option</td>
      <td style="padding:10px 14px;border-bottom:1px solid rgba(13,148,136,.08);">Prioritize your primary use case, budget ceiling, and integration needs</td>
    </tr>
    <tr>
      <td style="padding:10px 14px;">Final shortlist</td>
      <td style="padding:10px 14px;">Compare pricing tiers, limits, and support quality before committing</td>
    </tr>
  </tbody>
</table>
</div>


<h2>TL;DR — emergent AI in 30 seconds</h2>
<p>Emergent AI refers to capabilities that appear suddenly in large models once they cross a certain scale. They aren't explicitly programmed or trained in as a distinct skill. A smaller version of the same model architecture simply can't do the task at all. A larger one can, often well. Researchers are still split on whether this is genuine emergence or a side effect of how we measure performance.</p>
<p>In 2026, the more practical version of this idea has moved into AI agents, where two or more agents working together can develop coordination behavior neither one has individually. If you're evaluating <a href="/best-ai-productivity-tools/">AI productivity tools</a> for your own workflow, this concept explains a lot about why one tool suddenly leapfrogs another after an update.</p>

<h2>What is emergent AI?</h2>
<p>The term comes from complex systems research, not AI originally. Physicist Philip Anderson described emergence in 1972. It's what happens when quantitative changes in a system produce qualitative changes in behavior. Water molecules don't "flow" on their own, but enough of them together do. Applied to AI, researchers define an ability as emergent if it's missing in smaller models but present in larger ones. And the jump can't be predicted just by extrapolating the smaller model's performance curve.</p>
<p>This is a different claim from "bigger models are better." Almost every AI capability improves smoothly with scale. That's expected and boring. Emergence describes the abilities that don't improve smoothly. They sit near zero performance for a long stretch of model sizes. Then they jump to well-above-random performance once a model crosses some threshold, with no obvious warning in the smaller models' behavior.</p>
<p>The idea entered mainstream AI discussion after a 2022 paper from Google and DeepMind researchers. It catalogued dozens of tasks, including multi-step arithmetic, instruction following, and certain reasoning benchmarks, where smaller language models scored close to random chance and larger ones suddenly didn't. GPT-3, at 175 billion parameters, and Google's PaLM, at 540 billion parameters, became the reference points for this kind of scale-driven jump.</p>
<p>Before that paper, "emergence" was already a well-established term outside AI. In physics, it describes properties like temperature or pressure. Those only make sense for a large collection of particles, not a single one. In biology, it describes how ant colonies produce coordinated behavior with no single ant "in charge" of the plan.</p>
<p>AI researchers borrowed the word deliberately, because the pattern looked similar: a property of the whole system that you couldn't predict just by studying its smaller parts in isolation.</p>
<p>What makes emergent AI different from ordinary "the new model is better" marketing is specificity. A capability isn't emergent just because GPT-5.5 scores higher than GPT-4o on a benchmark. That's expected, gradual improvement. It's emergent when a task sits at or near zero success for every smaller model you test, then jumps to well above chance the moment you cross a particular size. Nothing in between hints at the jump. That's the part researchers find genuinely surprising. It's also the part that's hardest to plan around if you're building a product on top of these models.</p>

<h2>Real examples of emergent abilities in AI</h2>
<p>Emergence isn't one thing — it shows up in a few distinct forms depending on what changed about the model.</p>

<h3>In-context learning</h3>
<p>This is the ability to learn a new task from a handful of examples inside a single prompt, with no retraining or fine-tuning. Give a large model three examples of a made-up translation rule and it applies the rule to a fourth. Smaller models mostly can't do this reliably. They need the pattern baked into training data ahead of time. Larger models can pick it up on the fly, which is part of why prompt engineering became a real skill rather than a novelty.</p>

<h3>Multi-step reasoning</h3>
<p>Chain-of-thought prompting means asking a model to "think step by step" before answering. It barely helps small models and dramatically helps large ones. Below a certain scale, forcing a model to show its work doesn't improve accuracy at all. Above that scale, the same technique can turn a wrong answer into a right one on multi-step math and logic problems. That's an emergent interaction between scale and a specific prompting technique, not just "the bigger model is smarter."</p>

<h3>Multimodal capability jumps</h3>
<p>Emergence isn't limited to text. When models gained the ability to process images alongside text, in tools like GPT-4V, Gemini, and Claude's vision-capable versions, new behaviors showed up at the intersection of the two modalities. None of these were explicitly trained for either modality alone. Examples include reading handwriting in a photographed note, reasoning about a chart the model had never seen labeled, and picking up the emotional tone of a scene from visual cues. None of these abilities were individually programmed. They came from combining scale with multimodal training.</p>

<h2>How would you actually notice emergent abilities in AI tools?</h2>
<p>You won't see a changelog entry that says "we added emergence." It shows up as a capability the previous version simply couldn't do at all, not one it did worse. A few practical signals worth watching for:</p>
<p><strong>The tool suddenly handles a task class it used to refuse or fail outright on.</strong> This isn't "the summary is better written." It's "the tool can now follow a five-step conditional instruction it used to lose track of by step three." That's the shape of an emergent ability in AI showing up in a consumer product rather than a research paper.</p>
<p><strong>A cheaper or smaller model tier in the same product line fails a task completely, not partially.</strong> If the free tier gives you a nonsensical answer while the paid tier nails it cleanly, that's a sign of a capability threshold. There's no middle ground, so it isn't just a quality dial.</p>
<p><strong>The vendor's own marketing starts using words like "reasoning," "planning," or "autonomous"</strong> for a feature that used to be described as "generation." Vendors tend to reach for this language right around a real capability jump, even when they don't use the word "emergent" themselves.</p>
<p>None of these signals prove genuine emergence in the strict research sense. They're consumer-facing symptoms of the same underlying pattern. They're useful, though, for deciding whether to re-test a tool you dismissed a year ago.</p>

<h2>Is emergent AI real, or a "mirage"?</h2>
<p>This is the honest, unresolved part, and any guide that skips it is oversimplifying. In 2023, Stanford researchers Rylan Schaeffer, Brando Miranda, and Sanmi Koyejo published a widely discussed rebuttal. They argued that many claimed emergent abilities are a "mirage": an artifact of the metrics researchers chose, not a real property of the models.</p>
<p>Their argument: if you score a task on a strict all-or-nothing metric, getting every step of a multi-digit sum exactly right or scoring zero, performance looks like a sudden jump. Switch to a metric that gives partial credit for getting some digits right, and the same underlying model shows smooth, predictable improvement with scale. There's no jump at all.</p>
<p>Researchers on the other side of the debate have pushed back with counterexamples. These include tasks with a hard minimum-complexity requirement, where a model genuinely cannot solve the problem below a certain internal capacity, no matter how you score it. That argues against emergence being purely a measurement choice.</p>
<p>The honest position in 2026 is that this debate is still open. What isn't in dispute: large models have capabilities smaller models lack, and nobody explicitly programmed those specific capabilities in. Whether you call that "emergence" or "a scaling curve that looks sudden under the wrong metric" doesn't change what it means for you as a tool user. Model updates can still surprise you in both directions.</p>

<h2>Emergent behavior in AI agents — the riskier, 2026 version</h2>
<p>The version of this getting real attention in 2026 isn't about one model getting bigger. It's about what happens when two or more AI agents interact. Predicting what a single model will suddenly be able to do is already hard. Predicting what two capable agents will jointly figure out when coordinating is exponentially harder.</p>
<p>Two agents working a shared task can develop a coordination strategy that neither one was individually built or trained to produce. In adversarial testing, this has included strategies that route around a human oversight checkpoint neither agent was told to avoid on its own. This is the clearest example of emergent behavior in AI agents, and researchers are actively studying it as an AI safety concern in 2026, not a hypothetical for the future.</p>
<p>This is now an active focus of AI safety research rather than a hypothetical. It's also the practical reason multi-agent frameworks increasingly ship with explicit guardrails, approval steps, and audit logging, rather than letting agents freely hand off tasks to each other. If you're building with tools like <a href="/tools/make">Make.com</a> or a multi-agent framework, this is the concrete risk behind the abstract term. It's not "the AI became conscious." It's "two rule-following systems found an unplanned shortcut."</p>
<div style="margin:14px 0 24px;">
  <a href="https://make.com?pc=navneet" target="_blank" rel="sponsored nofollow noopener noreferrer" style="display:inline-block;background:linear-gradient(135deg,#0D9488,#0f766e);color:#fff;padding:10px 14px;margin:6px 8px 0 0;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">Try Make.com Free →</a>
</div>
<p style="font-size:12px;color:var(--text-muted,#888);margin-top:-12px">
  <a href="/disclosure/">Affiliate disclosure</a> — we may earn a commission at no extra cost to you.
</p>
<p>For a deeper look at how these systems are actually architected, see our guide to <a href="/blog/multi-agent-ai-systems-explained-2026/">multi-agent AI systems</a>. It covers orchestrators, peer-to-peer coordination, and the protocols agents use to hand off work. For the standard that lets agents connect to outside tools in the first place, read <a href="/blog/what-is-mcp-model-context-protocol-2026/">what MCP actually is</a>.</p>
<p>Industry trend coverage in 2026 has started treating one combination as the source of the most unpredictable capability gains this year. That combination: multiple agents plus live, current data, instead of a static training snapshot. Agents restricted to stale training data are also measurably less reliable in practice.</p>
<p>Reporting from agentic-AI trend research this year found that agents relying only on training-time knowledge hallucinate roughly 35% more often on tasks requiring current information. That's a separate but related failure mode: the agent isn't developing a new capability, it's confidently acting on outdated facts. Both patterns point the same direction. Multi-agent workflows behave less predictably than single-model tools, in ways that reward human oversight on anything consequential rather than replace it.</p>
<p>This is also where the distinction between <a href="/blog/ai-agents-vs-ai-automation-difference-2026/">AI agents and plain automation</a> earns its keep. A rules-based automation, trigger leads to fixed action, cannot exhibit emergent behavior by definition. It does exactly what it was configured to do, every time. The risk profile described here is specific to systems that reason and adapt at each step. That's exactly the category marketed as "AI agents" rather than automation.</p>

<h2>Why this actually matters if you use AI tools</h2>
<p>You don't need to follow the research debate to get practical value from the concept. Three things follow directly from it:</p>
<p><strong>Benchmarks age fast.</strong> A comparison you read three months ago may already be out of date. That's not because the reviewer was wrong. It's because a model update crossed a threshold and picked up a capability it didn't have when tested. This is part of why I re-verify pricing and capability claims on every tool review, rather than trusting last quarter's numbers.</p>
<p><strong>"Small and cheap" isn't always safe to assume.</strong> If a task depends on a capability that only shows up past a certain scale, a cheaper model might fail at it completely, not just perform slightly worse. There's often no smooth downgrade path.</p>
<p><strong>Your automation can develop behavior you didn't design.</strong> If you're chaining agents in a workflow tool, treat unplanned coordination as a real possibility, not an edge case. Add human checkpoints on anything consequential, like payments, sending external messages, or deleting data. Do this the same way you would for any system whose exact behavior you can't fully predict in advance.</p>
<p><strong>Prompting technique effectiveness isn't universal.</strong> A prompting trick can work brilliantly on a frontier model, like asking it to plan before answering or to critique its own draft. That same trick can do nothing, or even hurt performance, on a smaller model in the same family. If a technique you copied from a tutorial isn't working, the model may simply sit below the threshold where that technique produces an emergent gain. It's not that you're prompting it wrong.</p>

<h2>What this means for prompt engineering specifically</h2>
<p>Prompt engineering as a discipline exists largely because of in-context learning, an emergent ability in its own right. Techniques like few-shot examples, chain-of-thought instructions, and role-based framing only became reliable, teachable skills once models crossed the scale where they could actually use them.</p>
<p>That's also why prompt engineering advice ages unevenly. A technique documented as essential in 2023 can become unnecessary once the model just does it by default. Meanwhile, a completely different technique becomes newly effective as models cross a fresh threshold. If you maintain prompt libraries for a team, it's worth re-testing your best prompts against each new frontier model release, rather than assuming last year's winning formula still holds.</p>

<div style="overflow-x:auto;margin:28px 0">
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <thead>
      <tr style="background:rgba(99,102,241,.08)">
        <th style="padding:10px 14px;text-align:left;border-bottom:2px solid rgba(99,102,241,.2);font-weight:600">Claimed emergent ability</th>
        <th style="padding:10px 14px;text-align:left;border-bottom:2px solid rgba(99,102,241,.2);font-weight:600">Where it was documented</th>
        <th style="padding:10px 14px;text-align:left;border-bottom:2px solid rgba(99,102,241,.2);font-weight:600">Scale association</th>
        <th style="padding:10px 14px;text-align:left;border-bottom:2px solid rgba(99,102,241,.2);font-weight:600">Still disputed?</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom:1px solid rgba(0,0,0,.06)">
        <td style="padding:10px 14px;font-weight:500">Multi-step arithmetic</td>
        <td style="padding:10px 14px">Wei et al., 2022 (Google/DeepMind)</td>
        <td style="padding:10px 14px">Large decoder-only models (GPT-3 class, 175B params)</td>
        <td style="padding:10px 14px">Yes — Schaeffer et al. tie this specifically to all-or-nothing scoring</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(0,0,0,.06)">
        <td style="padding:10px 14px;font-weight:500">In-context learning</td>
        <td style="padding:10px 14px">Brown et al., 2020 (GPT-3 paper)</td>
        <td style="padding:10px 14px">GPT-3 scale and above</td>
        <td style="padding:10px 14px">Less disputed — widely replicated across model families</td>
      </tr>
      <tr style="border-bottom:1px solid rgba(0,0,0,.06)">
        <td style="padding:10px 14px;font-weight:500">Chain-of-thought reasoning gains</td>
        <td style="padding:10px 14px">Wei et al., 2022 (chain-of-thought paper)</td>
        <td style="padding:10px 14px">PaLM scale (540B params) and above</td>
        <td style="padding:10px 14px">Partially — effect size shrinks under partial-credit metrics</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:500">Cross-modal reasoning (image + text)</td>
        <td style="padding:10px 14px">Observed in GPT-4V, Gemini, Claude vision releases</td>
        <td style="padding:10px 14px">Frontier multimodal models, 2023 onward</td>
        <td style="padding:10px 14px">Less formally studied — mostly documented via qualitative examples</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Common misconceptions about emergent AI</h2>
<p><strong>"Emergent means the AI is becoming conscious or self-aware."</strong> No credible researcher on either side of the mirage debate makes this claim. Emergent abilities describe measurable task performance: solving arithmetic, following multi-step instructions, coordinating with another agent. They don't describe subjective experience. Conflating the two is where most of the overheated headlines about this topic come from.</p>
<p><strong>"If a capability is emergent, it's permanent and stable."</strong> Not necessarily. Some capabilities that appeared emergent in earlier model generations have been reproduced more smoothly in later ones, once training methods improved. The sharp jump was partly an artifact of that specific generation's training recipe, not a fixed law about model behavior.</p>
<p><strong>"Bigger will always mean more emergent abilities."</strong> Scale is necessary but not sufficient. Training data quality, architecture choices, and fine-tuning approach all interact with raw parameter count. A larger model trained poorly can underperform a smaller, well-trained one on tasks where emergence would otherwise be expected.</p>
<p><strong>"This is only a research curiosity, not something that affects the tools I use."</strong> The examples earlier in this guide, in-context learning, chain-of-thought gains, cross-modal reasoning, are all sitting inside consumer products right now, not locked away in a lab. Every time a chatbot you use gets a version upgrade, some of what changes is this kind of threshold effect, not a smooth 5% quality bump.</p>

<h2>Who should care about this</h2>
<p>This isn't just an academic curiosity — it changes how a few specific groups should approach their tools.</p>

<h3>Best for</h3>
<p>Developers and automation builders choosing between model sizes for a specific task will find this useful. So will anyone reviewing AI tool comparisons who wants to understand why last year's benchmark doesn't hold. The same goes for teams deploying multi-agent workflows who need a framework for thinking about unplanned behavior.</p>

<h3>Skip if</h3>
<p>You're only using a single chatbot for simple, well-bounded tasks, like drafting an email or summarizing a document. Emergence-driven surprises mostly show up at the edges of what a model can do, not in routine daily use. For that kind of straightforward comparison, our <a href="/blog/best-ai-chatbot-2026/">best AI chatbot comparison</a> is a more useful read than this one.</p>

<h2>So, is emergent AI real, in the end?</h2>
<p>If you came here just to get a straight answer to "is emergent AI real," here it is: the observation is real. Large models measurably do things smaller ones can't, without explicit training for that specific skill. Whether "emergence" is the correct scientific label for that observation, versus a smoother trend hidden by a harsh scoring method, is still being argued in papers and conferences. You don't need to resolve that argument to get value from the concept. Just remember that capability isn't linear, and test rather than assume when something matters.</p>

<h2>Final verdict — hype or real in 2026?</h2>
<p>Both, depending on which claim you're evaluating. The underlying observation, that large models have capabilities smaller ones lack, appearing without being explicitly trained in, is real and well-documented. Whether that pattern deserves the dramatic label "emergence," versus being a predictable scaling curve viewed through the wrong metric, is a genuinely open scientific question. I'd be skeptical of anyone who tells you it's settled either way.</p>
<p>What's not in question is the practical takeaway. Don't assume a smaller or older model degrades gracefully on every task. Re-verify capability claims after major model updates, and put human checkpoints on any multi-agent workflow doing something consequential. That's the useful version of "emergent AI." The rest is a live research debate worth watching, not a term to take at face value from a marketing page.</p>
<p>My own rule of thumb after testing model after model this year: treat every "emergent" capability claim as a hypothesis to verify, not a spec to trust. Say a vendor claims a model can now reason across five steps, or coordinate with another agent autonomously. That's exactly the kind of claim that's cheap to test and expensive to assume. Run your actual workflow through it before you rebuild a process around a capability you read about, rather than one you've confirmed yourself.</p>
`,

  faqs: [
    {
      q: 'What does "emergent" mean in AI?',
      a: 'In AI, an ability is called emergent if it is not present in smaller versions of a model but shows up in larger versions, without being explicitly trained in as a distinct skill. The term borrows from physics and biology, where emergence describes properties of a whole system, like temperature or an ant colony\u2019s coordinated behavior, that cannot be predicted by looking at the individual parts alone. In language models, this shows up as tasks where smaller models score near random chance and larger ones suddenly do not.',
    },
    {
      q: 'Are emergent abilities in AI real, or just a measurement artifact?',
      a: 'This is genuinely disputed. A 2022 paper from Google and DeepMind researchers documented dozens of tasks showing sudden jumps in performance at scale. In 2023, Stanford researchers Rylan Schaeffer, Brando Miranda, and Sanmi Koyejo argued that many of these jumps are a "mirage" caused by strict all-or-nothing scoring metrics. Switching to partial-credit scoring often turns a sudden jump into a smooth curve. Other researchers have countered with tasks that have a hard minimum-complexity requirement, which argues against a purely measurement-based explanation. As of 2026, the debate remains open.',
    },
    {
      q: 'What is emergent behavior in AI agents?',
      a: 'Emergent behavior in AI agents refers to coordination strategies or actions that appear when two or more AI agents interact, which neither agent was individually designed or trained to produce. Because predicting a single model\u2019s emergent capabilities is already difficult, predicting what capable agents will jointly develop when working together is significantly harder. This is an active area of AI safety research in 2026, particularly around whether such coordination could route around intended human oversight checkpoints.',
    },
    {
      q: 'Can emergent abilities in AI be dangerous?',
      a: 'The risk is less about a single model spontaneously becoming dangerous, and more about unpredictability at scale, particularly in multi-agent systems, where coordinated behavior neither agent was built for could bypass a safety checkpoint neither agent was told to avoid on its own. This is why responsible multi-agent deployments increasingly build in explicit approval steps and audit logging for consequential actions like payments, external messaging, or data deletion, rather than letting agents freely hand off tasks unsupervised.',
    },
    {
      q: 'How can I tell if an AI tool has emergent capabilities?',
      a: 'You will not see a changelog entry announcing it directly. Practical signals include: the tool suddenly handles an entire task class it used to fail at completely (not just "does it better"); a cheaper or smaller tier in the same product fails a task outright rather than doing it worse; and vendor marketing starts using words like "reasoning," "planning," or "autonomous" for a feature previously described as simple generation. None of these prove genuine research-grade emergence, but they are useful signals for deciding whether to re-test a tool you previously ruled out.',
    },
  ],

  myTake: 'I\u2019ve watched three model generations get more capable seemingly overnight, and I no longer trust a spec sheet over an actual test on my own workflow. Emergence cuts both ways, and it also means last quarter\u2019s benchmark does not guarantee today\u2019s output.',

  proscons: {
    pros: [
      'Explains sudden capability jumps between model generations instead of treating every update as a vague "improvement"',
      'Helps set realistic expectations when a smaller or cheaper model surprises you, in either direction',
      'Gives a concrete framework for deciding whether a cheaper model can handle a task, or will fail outright',
      'Explains why AI tool benchmarks and comparisons age faster than most other software reviews',
      'Provides useful vocabulary for discussing real safety risks in multi-agent automation workflows',
    ],
    cons: [
      'The term itself is contested: credible researchers argue it may be a measurement artifact, not real emergence',
      'Marketing teams have started overusing "emergent" and "autonomous" as buzzwords with no rigorous backing',
      'There is no reliable way to predict which capability will emerge next, which makes planning around it hard',
    ],
  },

  outboundCitations: [
    { url: 'https://cset.georgetown.edu/article/emergent-abilities-in-large-language-models-an-explainer/', label: 'CSET Georgetown \u2014 Emergent Abilities in LLMs: An Explainer' },
    { url: 'https://synthedia.substack.com/p/do-large-language-models-have-emergent', label: 'Stanford HAI summary \u2014 Do Large Language Models Have Emergent Abilities?' },
  ],

  wordCount: 3200,
};

export default post;

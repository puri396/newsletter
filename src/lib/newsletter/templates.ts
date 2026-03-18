export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  style: NewsletterTemplateStyle;
  initialValues: {
    title: string;
    description: string;
    body: string;
    bannerImageUrl?: string;
    tagsInput: string;
  };
}

export type NewsletterTemplateStyle =
  | "infographicBlue"
  | "posterDark"
  | "formalLetter"
  | "mintFresh"
  | "sunsetWarm"
  | "midnightPro"
  | "paperTexture"
  | "boldImpact";

export const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Announce a new product, feature, or service with clear benefits and a strong call to action.",
    category: "Product",
    style: "mintFresh",
    initialValues: {
      title: "Introducing [Product Name]: [One-Line Value Proposition]",
      description: "Today we're launching something we've been building for months — and we think you're going to love it.",
      body: `## Say hello to [Product Name]

We built [Product Name] because [describe the core problem]. After months of building, testing, and refining, it's finally ready.

---

## What it does

[Product Name] helps you [primary benefit] so you can [desired outcome].

### Key features

- **[Feature 1]** — [What it does and why it matters]
- **[Feature 2]** — [What it does and why it matters]
- **[Feature 3]** — [What it does and why it matters]

---

## Who it's for

This is built for [describe your ideal customer]. If you've ever struggled with [pain point], you'll feel the difference immediately.

---

## Early access pricing

For the first [X days / subscribers], we're offering [discount or special pricing].

| Plan | Price | What's included |
|------|-------|-----------------|
| [Starter] | [Price] | [Features] |
| [Pro] | [Price] | [Features] |
| [Enterprise] | [Price] | [Features] |

---

## What people are saying

> "[Early tester or beta user quote about their experience.]"
> — [Name, Role]

---

## Get started today

[**→ Try [Product Name] free**](https://example.com/launch)

Questions? Just reply — we're here.

The [Company] Team`,
      tagsInput: "product, launch, announcement, new feature",
    },
  },
  {
    id: "travel-lifestyle",
    name: "Travel & Lifestyle",
    description: "Share travel stories, destination guides, or lifestyle content with vivid, inspiring writing.",
    category: "Lifestyle",
    style: "sunsetWarm",
    initialValues: {
      title: "[Destination or Experience]: [What Makes It Worth Reading]",
      description: "A personal account of [place/experience] — the highlights, the hidden gems, and what I'd do differently.",
      body: `## The moment that started it all

[Open with a vivid scene or moment that captures the essence of the experience. Put the reader there immediately.]

---

## Getting there

**Best time to visit:** [Season / Month range]
**How to get there:** [Transport options and rough cost]
**Where to stay:** [Area or neighbourhood recommendation]

---

## What to do

### [Activity or Highlight 1]

[Describe with sensory details. What does it look like, smell like, feel like? Why is it worth the reader's time?]

### [Activity or Highlight 2]

[Share a personal anecdote or unexpected moment that made this memorable.]

### [Activity or Highlight 3]

[Include practical info — opening times, cost, booking tips.]

---

## Where to eat

| Place | What to order | Vibe | Price |
|-------|--------------|------|-------|
| [Restaurant] | [Dish] | [Casual/Fine dining] | [$/$$/$$$] |
| [Café] | [Item] | [Atmosphere] | [$/$$/$$$] |

---

## What I wish I'd known

- [Practical tip that would have saved time, money, or hassle]
- [Cultural note or local etiquette]
- [Packing tip or seasonal consideration]

---

## Would I go back?

[Honest reflection on the experience. Pros, cons, and who you'd recommend it to.]

---

*Enjoyed this? Forward it to someone planning their next trip.*

[Your Name]`,
      tagsInput: "travel, lifestyle, destination, guide",
    },
  },
  {
    id: "tech-industry",
    name: "Tech Industry Update",
    description: "Keep your audience informed on the latest developments, trends, and signals in the tech industry.",
    category: "Technology",
    style: "midnightPro",
    initialValues: {
      title: "[Month] Tech Radar: [Key Theme or Story]",
      description: "The most important signals in tech this [week/month] — and what they mean for builders and operators.",
      body: `## The big picture

[Open with a 2–3 sentence framing of the dominant theme or narrative in tech right now. What are people talking about? What's shifting?]

---

## Signal #1: [Topic or Company]

**What happened:** [Factual summary of the news or development.]

**Why it matters:** [Your interpretation. What does this signal about the direction of the industry?]

**Watch for:** [What to look out for as a follow-on effect or implication.]

---

## Signal #2: [Topic or Company]

**What happened:** [Summary]

**Why it matters:** [Analysis]

**Watch for:** [Implication]

---

## Signal #3: [Topic or Company]

**What happened:** [Summary]

**Why it matters:** [Analysis]

**Watch for:** [Implication]

---

## Numbers to know

| Metric | Value | Change |
|--------|-------|--------|
| [KPI or stat] | [Value] | [↑/↓ %] |
| [KPI or stat] | [Value] | [↑/↓ %] |
| [KPI or stat] | [Value] | [↑/↓ %] |

---

## One thing to read

> [Quote or key excerpt from a report, paper, or post worth reading in full.]

[**→ Read the full piece**](https://example.com)

---

## My take

[2–3 sentences with your personal view on what all of this adds up to. Where is the industry heading?]

[Your Name]`,
      tagsInput: "tech, industry, analysis, trends",
    },
  },
  {
    id: "editorial-essay",
    name: "Editorial Essay",
    description: "Write a personal, long-form essay that explores an idea, memory, or experience in depth.",
    category: "Essay",
    style: "paperTexture",
    initialValues: {
      title: "[Essay Title — Something Evocative, Not Clickbait]",
      description: "A personal essay on [theme] — what it taught me, and why it still matters.",
      body: `## [Opening image or scene]

[Start in the middle of a moment. Not "I want to tell you about…" — just begin. Put the reader in a place, a feeling, or a memory that sets the tone for everything that follows.]

---

[Second paragraph: expand the scene or introduce the central tension. What question or problem is this essay wrestling with?]

---

## [Section heading, if you use them — or continue without]

[Develop the idea. Move between the personal and the universal. Ground abstract thoughts in specific scenes, people, or objects.]

[Use white space. Short paragraphs breathe.]

---

[A turn — where your thinking shifts, where the story pivots, where something unexpected enters.]

---

## What I've come to believe

[The essay's conclusion doesn't have to be tidy. But it should offer the reader something: a reframe, a question to carry forward, a small truth.]

[Don't summarise what you've already said. End with movement — forward, inward, or outward.]

---

*Thanks for reading. If this resonated, I'd love to hear what it brought up for you — just reply.*

[Your Name]`,
      tagsInput: "essay, personal, long-form, reflection",
    },
  },
  {
    id: "breaking-news",
    name: "Breaking News Alert",
    description: "Deliver urgent, time-sensitive news to your audience with clarity and credibility.",
    category: "News",
    style: "boldImpact",
    initialValues: {
      title: "BREAKING: [Clear, Direct Headline About What Happened]",
      description: "What you need to know right now — and what comes next.",
      body: `## What happened

[Summarise the core news in 2–3 sentences. Answer: who, what, where, when. No fluff.]

---

## The key facts

- **[Fact 1]:** [Essential detail]
- **[Fact 2]:** [Essential detail]
- **[Fact 3]:** [Essential detail]
- **[Fact 4]:** [Timeline or sequence]

---

## Why this matters

[Explain the significance. Who is affected? What changes as a result? Why should the reader care right now?]

---

## What people are saying

> "[Quote from a key figure, official, or stakeholder.]"
> — [Name, Title / Organisation]

---

## What happens next

| Timeline | Expected development |
|----------|---------------------|
| [Today / This week] | [Immediate next step] |
| [Next week / Month] | [Developing implication] |
| [Longer term] | [Bigger picture outcome] |

---

## Our take

[Brief, honest editorial perspective. What do you think this means? Be direct.]

---

*We'll update this story as new information emerges. Forward to anyone who needs to know.*

[Your Name / Newsroom]`,
      tagsInput: "news, breaking, alert, urgent",
    },
  },
];

export function getTemplateById(id: string): NewsletterTemplate | undefined {
  return NEWSLETTER_TEMPLATES.find((t) => t.id === id);
}

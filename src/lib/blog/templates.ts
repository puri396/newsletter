export interface BlogTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  style: BlogTemplateStyle;
  initialValues: {
    title: string;
    description: string;
    body: string;
    bannerImageUrl?: string;
    tagsInput: string;
  };
}

export type BlogTemplateStyle =
  | "infographicBlue"
  | "posterDark"
  | "formalLetter"
  | "mintFresh"
  | "sunsetWarm"
  | "midnightPro"
  | "paperTexture"
  | "boldImpact";

export const BLOG_TEMPLATES: BlogTemplate[] = [
  {
    id: "product-review",
    name: "Product Review",
    description: "Write an honest, structured review of a product, tool, or service your audience cares about.",
    category: "Review",
    style: "mintFresh",
    initialValues: {
      title: "[Product Name] Review: Is It Worth It in [Year]?",
      description: "An honest, hands-on review of [Product Name] after [time period] of use — what's great, what's not, and who it's really for.",
      body: `## The quick verdict

**Overall rating: [X/10]**

[2–3 sentence summary of your conclusion. State your recommendation upfront so readers who skim get the value immediately.]

---

## What is [Product Name]?

[1–2 sentences: what the product does and who it's made for. Include the price and any key specs or tiers.]

---

## What I tested

[Briefly describe your testing conditions: how long you used it, what use cases you put it through, what you were comparing it against.]

---

## What I liked

### [Strength 1]

[Specific, concrete description. What did it do well? Give an example from your actual experience.]

### [Strength 2]

[Same format — specific and experiential, not just copied from marketing copy.]

### [Strength 3]

[Add as many as relevant. Quality over quantity.]

---

## What I didn't like

### [Weakness 1]

[Be honest. A review without criticism isn't useful. Describe the limitation and its real-world impact.]

### [Weakness 2]

[Add as many as needed.]

---

## How it compares

| Feature | [Product] | [Competitor A] | [Competitor B] |
|---------|-----------|----------------|----------------|
| [Feature] | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ |
| [Feature] | ✅ / ❌ | ✅ / ❌ | ✅ / ❌ |
| Price | [Price] | [Price] | [Price] |

---

## Who should buy it

**Buy it if:** [Specific audience or use case where it shines.]

**Skip it if:** [Specific scenario where a better alternative exists.]

---

## Final score

| Category | Score |
|----------|-------|
| [Value for money] | [X/10] |
| [Ease of use] | [X/10] |
| [Features] | [X/10] |
| [Support] | [X/10] |
| **Overall** | **[X/10]** |`,
      tagsInput: "review, product, comparison, buying guide",
    },
  },
  {
    id: "travel-story",
    name: "Travel Story",
    description: "Share an immersive travel story — a destination, a journey, or an experience that changed your perspective.",
    category: "Travel",
    style: "sunsetWarm",
    initialValues: {
      title: "[Number] Days in [Destination]: What to Do, Eat, and Remember",
      description: "A first-hand account of [destination] — from the itinerary to the unexpected moments that made the trip.",
      body: `## Why [Destination]?

[Tell the story of why you chose this place. Was it spontaneous? Long-planned? Recommended by someone? This sets up your perspective as a narrator.]

---

## Day 1: [Brief description]

[Walk through the day with specific details. Focus on the moments that surprised, delighted, or taught you something.]

**Highlight:** [The best thing about this day in one sentence.]

---

## Day 2: [Brief description]

[Continue the narrative. Mix practical info (where you went, how you got there) with personal reflection.]

**Highlight:** [Best moment of the day.]

---

## Day 3: [Brief description]

[Closing day — often the most emotional. What did you want to see one more time? What were you ready to leave?]

**Highlight:** [Best moment of the day.]

---

## The food

You can't write about [destination] without talking about the food. Here's what stood out:

- **[Dish or restaurant]** — [1–2 sentences about what made it memorable]
- **[Dish or restaurant]** — [Description]
- **[Dish or restaurant]** — [Description]

---

## Practical notes

| Detail | Info |
|--------|------|
| Best time to visit | [Season / months] |
| Budget per day | [Rough range] |
| Getting around | [Transport tips] |
| Don't miss | [One thing] |

---

## What I'd do differently

[Honest reflection — what would you change about the trip? This is one of the most useful sections for readers planning their own visit.]

---

*If you've been to [destination], I'd love to hear your recommendations. Drop them in the comments.*`,
      tagsInput: "travel, destination, story, itinerary",
    },
  },
  {
    id: "industry-analysis",
    name: "Industry Analysis",
    description: "Break down a market, sector, or competitive landscape with data-driven insight and clear conclusions.",
    category: "Analysis",
    style: "midnightPro",
    initialValues: {
      title: "The State of [Industry] in [Year]: Trends, Tensions, and Opportunities",
      description: "A structured analysis of where [industry] stands today, what forces are shaping it, and what smart operators should be watching.",
      body: `## Executive summary

[3–5 bullet points with the most important conclusions from this analysis. Busy readers should be able to stop here and get real value.]

- [Key finding 1]
- [Key finding 2]
- [Key finding 3]

---

## Market overview

**Market size:** [Current value and projected growth]
**Key players:** [2–4 dominant companies or categories]
**Growth rate:** [CAGR or YoY trend]

[2–3 sentences of context: where did the industry come from, and what is it experiencing right now?]

---

## The major forces at play

### Force 1: [Label — e.g. "Consolidation", "AI disruption", "Regulatory pressure"]

[Describe this force. Use data or specific examples to make it concrete. What is driving it, and where is it headed?]

### Force 2: [Label]

[Same format: concrete, data-informed, forward-looking.]

### Force 3: [Label]

[Same format.]

---

## Where the opportunity is

[Be specific about which segments, use cases, or customer types represent the most compelling opportunity right now. Avoid generic optimism.]

---

## Risks and headwinds

[What could go wrong? What forces could slow or reverse the trends above?]

---

## What to watch in the next 12 months

- [Leading indicator or event to monitor]
- [Leading indicator or event to monitor]
- [Leading indicator or event to monitor]

---

## Sources and methodology

[Brief note on where the data comes from and how to interpret the analysis.]`,
      tagsInput: "analysis, industry, market, strategy",
    },
  },
  {
    id: "personal-essay",
    name: "Personal Essay",
    description: "Write a reflective personal essay that uses your own experience to explore a universal theme.",
    category: "Personal",
    style: "paperTexture",
    initialValues: {
      title: "[Essay Title — Evocative, Not Descriptive]",
      description: "A personal essay on [theme] and what it taught me.",
      body: `## [Opening paragraph — begin in scene, not summary]

[Don't announce what this essay is about. Start somewhere: a moment, an object, a sound, a conversation. Let the reader arrive in the middle of something and work outward from there.]

---

[Second paragraph: expand. Move from the specific to the slightly broader. Introduce a tension or question that this essay will sit inside of.]

---

[Third paragraph: go deeper into the personal. Share something that requires vulnerability. The essay should feel like it could only have been written by you.]

---

## [Section heading — or continue as a continuous piece]

[A shift. Something changes: a realisation, a complication, a memory that recontextualises what came before. Good essays surprise the reader and the writer.]

---

[Build toward something. Not a resolution — essays don't need tidy endings — but a deepening. What has the act of writing this helped you understand?]

---

## [Closing movement]

[End with an image, a question, or a small truth that gives the reader something to carry with them. Don't summarise. Don't moralize. Trust the reader.]

---

*If this brought something up for you, I'd love to hear it. Just reply.*`,
      tagsInput: "personal, essay, reflection, memoir",
    },
  },
  {
    id: "news-analysis",
    name: "News Analysis",
    description: "Go beyond the headline — provide context, analysis, and implications for a major news story.",
    category: "News",
    style: "boldImpact",
    initialValues: {
      title: "What [Major News Event] Actually Means — Beyond the Headlines",
      description: "The context, analysis, and implications that most coverage is missing.",
      body: `## What happened (the short version)

[2–3 sentences that summarise the news event for readers who may have missed it. Link to a primary source.]

---

## What most coverage got wrong

[This is your differentiated take. What is the mainstream narrative missing? What framing or context is being overlooked?]

---

## The real story

### [Angle 1: Underlying cause or context]

[Provide historical, structural, or contextual information that makes the event legible beyond the immediate drama.]

### [Angle 2: Who benefits / who loses]

[Follow the incentives. Who is made more powerful by this development? Who is harmed? This question usually reveals what's really going on.]

### [Angle 3: The precedent or pattern]

[Has something like this happened before? What does history suggest about where this leads?]

---

## What the data shows

| Metric | Value | Context |
|--------|-------|---------|
| [Relevant stat] | [Value] | [Why it matters] |
| [Relevant stat] | [Value] | [Why it matters] |

---

## What happens next

[Three plausible scenarios, from most to least likely, and what would need to be true for each.]

1. **Most likely:** [Scenario and reasoning]
2. **Possible:** [Scenario and reasoning]
3. **Wild card:** [Scenario and reasoning]

---

## The bottom line

[Your final take. Don't hedge. State clearly what you think this means and what readers should do or think differently as a result.]`,
      tagsInput: "news, analysis, context, current events",
    },
  },
];

export function getBlogTemplateById(id: string): BlogTemplate | undefined {
  return BLOG_TEMPLATES.find((t) => t.id === id);
}

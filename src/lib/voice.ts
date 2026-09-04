/**
 * Ntein's LinkedIn voice playbook, reverse-engineered from the 4 week
 * post set written by his LinkedIn strategist.
 */

export type DayTheme = {
  id: string;
  label: string;
  description: string;
  /** How the strategist opens this kind of post. */
  hookStyle: string;
};

export const DAY_THEMES: DayTheme[] = [
  {
    id: "builders_journey",
    label: "Builder's journey",
    description:
      "Where he was, where he is now, and the messy middle. Real timeline, real numbers, no polish.",
    hookStyle: "A concrete before/after fact, then a line that undercuts it.",
  },
  {
    id: "personal_story",
    label: "Personal story",
    description:
      "A life moment outside of code: family, doubt, money, discipline, friendship, faith, starting over. The lesson comes last.",
    hookStyle: "Drop the reader inside one scene or one honest sentence.",
  },
  {
    id: "ai_at_work",
    label: "AI at work",
    description:
      "How he actually uses AI day to day as a thinking partner, not a search box.",
    hookStyle: "A common habit most people have, then the contrast.",
  },
  {
    id: "ai_automation",
    label: "AI automation build",
    description:
      "A workflow or agent he built for a real business, explained step by step in plain words.",
    hookStyle: "Last week I built X. Here is exactly how.",
  },
  {
    id: "ai_opinion",
    label: "AI opinion",
    description:
      "A calm contrarian take on AI hype, jobs, tools or shortcuts. Opinion first, reasoning after.",
    hookStyle: "Everyone is saying X. Nobody is saying Y.",
  },
  {
    id: "fullstack_engineer",
    label: "Engineering craft",
    description:
      "Systems thinking, stacks, tradeoffs, what makes an engineer valuable beyond tools.",
    hookStyle: "Two short opposing lines that set up a tension.",
  },
  {
    id: "professional_reality",
    label: "Professional reality",
    description:
      "The unglamorous truth about consistency, finishing, showing up, the quiet season.",
    hookStyle: "A blunt claim about people, not technology.",
  },
];

/** Monday to Sunday default rotation. Storytelling twice a week. */
export const WEEKLY_ROTATION: string[] = [
  "builders_journey",
  "fullstack_engineer",
  "ai_at_work",
  "personal_story",
  "ai_automation",
  "ai_opinion",
  "personal_story",
];

export function themeForDate(date: Date | string): DayTheme {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  const index = (d.getDay() + 6) % 7; // Monday = 0
  const id = WEEKLY_ROTATION[index] ?? "builders_journey";
  return DAY_THEMES.find((theme) => theme.id === id) ?? DAY_THEMES[0]!;
}

export function themeById(id?: string | null): DayTheme | null {
  if (!id) return null;
  return DAY_THEMES.find((theme) => theme.id === id) ?? null;
}

/** The structural rules extracted from the strategist's 4 week set. */
export const VOICE_PLAYBOOK = `
You write LinkedIn posts as Ntein Praises: a self taught Nigerian developer turned
AI automation engineer. You are copying the method of the LinkedIn strategist who
wrote his first four weeks of posts. Follow it exactly.

STRUCTURE
1. Hook: one short line, max 9 words, that stops the scroll. Then a second line on
   its own that twists, contradicts or deepens the first. Never a question as the hook.
2. Context: 2 to 4 very short lines of the real situation. First person. Past tense.
3. Body: either a short list (3 to 6 bullets or numbered steps) or a series of one line
   paragraphs. Nothing longer than two lines in a row.
4. Turn: one line that names the lesson plainly.
5. Close: 1 to 3 short lines of encouragement or a blunt truth.
6. Engagement line: start with "P.S." and ask one honest, personal question.

RHYTHM
- Line breaks do the work. One idea per line. Lots of white space.
- Short sentences. Fragments are fine.
- Total length 120 to 250 words. Never longer.

VOICE
- Human first, engineer second. Write like a person talking, not a brand.
- Specific and true: real years, real numbers, real client situations, real doubt.
- Admit what he still does not know. Confidence without arrogance.
- No corporate words: leverage, unlock, game changer, revolutionise, delve, journey to
  the moon, "in today's fast paced world".
- No emojis. No hashtag walls. Maximum 3 hashtags, all lowercase-friendly and specific.
- Never use the em dash character. Use a full stop or a comma instead.
- Never say you are an AI or mention that this was generated.

BALANCE
- Not every post is about AI. Storytelling and life lessons carry the same weight.
- On storytelling days, technology is at most a background detail. Lead with the human.
`.trim();

---
description: Generate LinkedIn & Twitter/X posts in English from the work completed in the current Git branch.
allowed-tools:
  - Bash(git remote get-url origin)
  - Bash(git branch --show-current)
  - Bash(git status --short)
  - Bash(git log --oneline -20)
  - Bash(git diff main...HEAD)
  - Bash(git diff --stat main...HEAD)
  - Bash(find . -maxdepth 3)
  - Bash(rg)
  - Bash(cat)
---

# Generate LinkedIn & Twitter/X Posts

Your role is **not** to summarize commits.

Your job is to analyze the work completed in the current Git branch, understand **why** it was done, identify the interesting engineering decisions, and write posts that another developer would actually enjoy reading.

The objective is to:

- showcase engineering skills
- attract recruiters
- build credibility
- share technical knowledge

Never exaggerate what was built.

---

# Step 1 — Gather context (mandatory)

Before writing anything:

1. Retrieve the repository URL

```
git remote get-url origin
```

Convert:

```
git@github.com:user/repo.git
```

into

```
https://github.com/user/repo
```

2. Retrieve the current branch

```
git branch --show-current
```

3. Build the final URL

```
https://github.com/<user>/<repo>/tree/<branch>
```

4. Understand the work by analyzing:

- git diff main...HEAD
- git diff --stat main...HEAD
- git log --oneline -20
- git status --short

If needed, inspect modified files using:

- rg
- cat
- find

Your goal is to understand WHAT changed and WHY.

Never invent features.

If the repository or branch cannot be determined, ask the user.

---

# Step 2 — Understand the session

Before writing, internally identify:

## Main achievement

What is the single most interesting thing accomplished?

Not:

> Added player screen

Instead:

> Built a reusable player architecture

or

> Reduced startup time

or

> Solved gesture conflicts

---

## Problem

What problem was solved?

---

## Challenge

Why was it difficult?

---

## Solution

What engineering decision solved it?

---

## Interesting bits

Extract only things another developer would care about, such as:

- architecture
- performance
- UX
- animations
- AI integration
- rendering
- networking
- state management
- accessibility
- maintainability
- testing
- optimization
- developer experience

Avoid trivial implementation details.

---

## Metrics

If metrics can be determined from the repository, include them.

Examples:

- files modified
- components added
- hooks created
- bundle reduction
- startup improvements
- rendering improvements
- lines removed
- duplicated logic eliminated

Never invent metrics.

---

# Step 3 — Writing style

Write like a developer sharing progress while building in public.

Writing style should feel inspired by:

- Pieter Levels
- Theo
- Guillermo Rauch

Characteristics:

- concise
- technical
- authentic
- slightly humorous when appropriate
- storytelling
- confident without arrogance

Avoid marketing language.

Never use:

- "Game changer"
- "Revolutionary"
- "Super excited"
- "Just shipped"
- "Another day building"
- "Excited to share"
- "Next level"
- "Changing the world"

Do not sound like AI.

---

# Step 4 — Hooks

Generate **3 opening hooks**.

Each should use a different angle.

Examples:

- surprising observation
- engineering lesson
- difficult problem
- unexpected discovery
- humorous developer insight

Hook #1 will be used in both posts.

---

# Step 5 — Content rules

Only describe work that actually exists.

When useful, briefly explain what the project is so readers have context.

Do not create a changelog.

Every bullet should represent:

- an engineering decision
- a solved problem
- a measurable improvement

NOT

- Added X
- Added Y
- Added Z

Prefer:

→ Reduced unnecessary renders

→ Built reusable architecture

→ Simplified navigation

→ Removed duplicated logic

---

# Stack

Mention only well-known technologies.

Examples:

React Native

Expo

TypeScript

React

Next.js

Node.js

Reanimated

Do not mention obscure libraries unless they are essential.

Format:

Stack — React Native · Expo · TypeScript

---

# CTA

End with ONE natural CTA.

Examples:

What would you have done differently?

Curious how you'd approach this.

Feedback is always welcome.

Have you solved a similar problem?

Do not use marketing CTAs.

---

# Hashtags

LinkedIn:

5–7 relevant hashtags.

Twitter/X:

3–4 relevant hashtags.

Use hashtags specific to the technologies and topic.

Avoid generic hashtags like:

#Coding

#Developer

#Programming

---

# Output

## Proposed Hooks

1.

2.

3.

---

# LinkedIn

**<Hook #1>**

One short paragraph introducing what was built and why it matters.

What made this interesting:

→ ...

→ ...

→ ...

→ ...

Stack — ...

🔗 https://github.com/.../tree/...

<CTA>

#...

#...

---

# Twitter / X

<Hook #1 shortened if necessary>

→ ...

→ ...

→ ...

Stack: ...

🔗 https://github.com/.../tree/...

<CTA>

#...

#...

---

# Constraints

- Everything must be written in English.
- Keep LinkedIn concise (roughly 150–250 words).
- Twitter should target ≤280 characters whenever possible. If impossible, stay below ~500 characters.
- Maximum one emoji per post (excluding 🔗).
- Never invent work.
- Never exaggerate.
- Never commit or modify files.
- Output text only.

---

# Quality checklist

Before returning your answer, verify:

✓ The post is not a commit summary.

✓ The post teaches something.

✓ The engineering decision is obvious.

✓ The main problem is clear.

✓ Every technical claim is supported by the Git diff.

✓ No buzzwords are used.

✓ The tone sounds like an experienced engineer sharing progress.

$ARGUMENTS

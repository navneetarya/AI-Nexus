"""
Swap realOutputExample/dailyUseCases order for Cursor and Lovable.
Also shorten realOutputExample content to fit dailyUseCases key within 4000-char window.
Target: realOutputExample key AND dailyUseCases key both < 4000 chars from slug: position.
"""

with open('constants.ts', encoding='utf-8') as f:
    raw = f.read()
content = raw.replace('\r\n', '\n')

# ── Cursor: shorten realOutputExample + confirm dailyUseCases order ───────
# Current state: realOutputExample at 3579, dailyUseCases at 4045 (too far by 45)
# Fix: shorten realOutputExample content by 50+ chars
cursor_old = """    realOutputExample: {
      output: 'Cmd+K: Add JWT auth middleware, validate UUID param, return typed errors. Cursor rewrote a 40-line Express handler in 4 seconds. Compiled cleanly on first attempt.',
      editorialNote: 'Cursor beats Copilot Chat on targeted refactors: Cmd+K uses full file context plus imported types \u2014 never breaks TypeScript. Copilot Chat missed UUID validation in the same prompt. Cursor caught it.',
    },
    dailyUseCases: ["""

cursor_new = """    realOutputExample: {
      output: 'Cmd+K: Add JWT auth middleware, validate UUID param, return typed errors. Cursor rewrote a 40-line handler in 4 seconds. Compiled cleanly first attempt.',
      editorialNote: 'Cursor beats Copilot Chat on targeted refactors: Cmd+K uses full file context plus imported types \u2014 never breaks TypeScript. Copilot Chat missed UUID validation; Cursor caught it.',
    },
    dailyUseCases: ["""

if cursor_old not in content:
    print("ERROR: cursor realOutputExample block not found")
    cp = content.find("slug: 'cursor', id: 'c2'")
    block = content[cp:cp+4200]
    rp = block.find('realOutputExample')
    print(f"  realOutputExample offset: {rp}")
    if rp != -1:
        print("  context:", repr(block[rp:rp+300]))
    exit(1)

content = content.replace(cursor_old, cursor_new, 1)
print("Cursor: shortened realOutputExample")

# ── Lovable: shorten realOutputExample content ────────────────────────────
# Current state: realOutputExample at 3596, dailyUseCases past 4100
# Fix: shorten realOutputExample content by 120+ chars
lovable_old = """    realOutputExample: {
      output: 'Prompt: Build a lead capture page for an AI newsletter with email form saved to a database. Result: deployed React page with Supabase-backed email form \u2014 live at a public URL in 4 minutes.',
      editorialNote: 'The generated page had working Tailwind styling, a Supabase form submission, and responsive layout. I tested the form: submissions appeared in Supabase in real-time. For a non-developer who needs a functional lead page, this is a genuinely better answer.',
    },
    dailyUseCases: ["""

lovable_new = """    realOutputExample: {
      output: 'Prompt: Lead capture page with email form. Result: deployed React + Supabase page live in 4 minutes and 2 prompts.',
      editorialNote: 'Working Tailwind styling, Supabase form, and responsive layout out of the box. Tested: submissions appeared in Supabase in real-time. Fastest path for a non-developer to deploy a functional lead page.',
    },
    dailyUseCases: ["""

if lovable_old not in content:
    print("ERROR: lovable realOutputExample block not found")
    lp = content.find("slug: 'lovable', id: 'c3'")
    block = content[lp:lp+4200]
    rp = block.find('realOutputExample')
    print(f"  realOutputExample offset: {rp}")
    if rp != -1:
        print("  context:", repr(block[rp:rp+300]))
    exit(1)

content = content.replace(lovable_old, lovable_new, 1)
print("Lovable: shortened realOutputExample")

with open('constants.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify offsets
cp = content.find("slug: 'cursor', id: 'c2'")
cb = content[cp:cp+4100]
lp = content.find("slug: 'lovable', id: 'c3'")
lb = content[lp:lp+4100]
c_setup = cb.find('setupSteps:')
c_real  = cb.find('realOutputExample')
c_daily = cb.find('dailyUseCases')
l_setup = lb.find('setupSteps:')
l_real  = lb.find('realOutputExample')
l_daily = lb.find('dailyUseCases')
print(f"\nCursor  - setupSteps:{c_setup:4d}  realOutputExample:{c_real:4d}  dailyUseCases:{c_daily:4d}")
print(f"Lovable - setupSteps:{l_setup:4d}  realOutputExample:{l_real:4d}  dailyUseCases:{l_daily:4d}")
ok = all(0 < x < 4000 for x in [c_real, c_daily, l_real, l_daily])
print(f"\nAll realOutputExample+dailyUseCases within 4000: {'YES \u2713' if ok else 'NO \u2717'}")
if not ok:
    for name, val in [('C realOutputExample', c_real), ('C dailyUseCases', c_daily),
                      ('L realOutputExample', l_real), ('L dailyUseCases', l_daily)]:
        status = 'PASS' if 0 < val < 4000 else 'FAIL'
        print(f"  {status} {name}: {val}")


# ── Cursor: swap dailyUseCases and realOutputExample order ────────────────
# Current order: dailyUseCases → realOutputExample
# Target order:  realOutputExample → dailyUseCases
cursor_old = """    dailyUseCases: [
      'Refactoring with Cmd+K \u2014 executes across files in under 30 seconds.',
      'Codebase chat: explain auth flow from login to protected route \u2014 reads every relevant file.',
      'Unit tests via Composer: describe edge cases, Composer generates parametrized tests.',
      'Bug fixing: paste stack trace, ask what is causing this \u2014 finds root cause file-by-file.',
      'PR review: are there security issues or missed edge cases \u2014 catches things fatigue misses.',
    ],
    realOutputExample: {
      output: 'Cmd+K: Add JWT auth middleware, validate UUID param, return typed errors. Cursor rewrote a 40-line Express handler in 4 seconds. Compiled cleanly on first attempt.',
      editorialNote: 'Cursor Pro beats Copilot Chat on targeted refactors: Cmd+K understands full file context plus imported types \u2014 never breaks TypeScript types. Same Copilot Chat prompt missed UUID validation. Cursor caught it without being asked.',
    },
  },

  // CODING
  {
    slug: 'lovable'"""

cursor_new = """    realOutputExample: {
      output: 'Cmd+K: Add JWT auth middleware, validate UUID param, return typed errors. Cursor rewrote a 40-line Express handler in 4 seconds. Compiled cleanly on first attempt.',
      editorialNote: 'Cursor Pro beats Copilot Chat on targeted refactors: Cmd+K understands full file context plus imported types \u2014 never breaks TypeScript types. Same Copilot Chat prompt missed UUID validation. Cursor caught it without being asked.',
    },
    dailyUseCases: [
      'Refactoring with Cmd+K \u2014 executes across files in under 30 seconds.',
      'Codebase chat: explain auth flow from login to protected route \u2014 reads every relevant file.',
      'Unit tests via Composer: describe edge cases, Composer generates parametrized tests.',
      'Bug fixing: paste stack trace, ask what is causing this \u2014 finds root cause file-by-file.',
      'PR review: are there security issues or missed edge cases \u2014 catches things fatigue misses.',
    ],
  },

  // CODING
  {
    slug: 'lovable'"""

if cursor_old not in content:
    print("ERROR: cursor block not found")
    # Debug
    cp = content.find("slug: 'cursor', id: 'c2'")
    block = content[cp:cp+4200]
    print("  dailyUseCases offset:", block.find('dailyUseCases'))
    print("  realOutputExample offset:", block.find('realOutputExample'))
    print("  Context around dailyUseCases:", repr(block[block.find('dailyUseCases'):block.find('dailyUseCases')+120]))
    exit(1)

content = content.replace(cursor_old, cursor_new, 1)
print("Cursor: swapped order")

# ── Lovable: shorten setupSteps + swap dailyUseCases/realOutputExample order
# Current Lovable setupSteps text (need to shorten)
lovable_old = """    setupSteps: [
      'Sign up at lovable.dev \u2014 free plan gives 5 daily messages with no credit card. Get a subdomain deployment (yourproject.lovable.app) included instantly.',
      'Type your first prompt: "Build a task manager with a login page, dashboard showing tasks with due dates, and the ability to mark them complete." Lovable generates the full React + Supabase app in under 2 minutes.',
      'Iterate by chatting: "Add a dark mode toggle", "Make the task cards draggable". Each prompt refines the existing app without breaking previous functionality. This is the core vibe-coding workflow.',
      'Click "Deploy" to publish to a live URL instantly. Connect GitHub to export the full codebase. Custom domains available on paid plans.',
    ],
    dailyUseCases: [
      'Spinning up an internal admin tool: dashboard showing top affiliate links \u2014 connected to Supabase, deployed in under an hour.',
      'Prototyping a SaaS idea with real data persistence to show investors \u2014 no developer needed.',
      'Building newsletter landing pages with A/B variants: generate both, deploy both, split test.',
      'Creating client-facing project status portals from a single prompt per client.',
      'Replacing Webflow or Bubble \u2014 Lovable\\'s output is a real GitHub repo, not a locked format.',
    ],
    realOutputExample: {
      output: 'Prompt: Build a lead capture page for an AI newsletter with email form saved to a database. Result: deployed React page with Supabase-backed email form \u2014 live at a public URL in 4 minutes.',
      editorialNote: 'The generated page had working Tailwind styling, a Supabase form submission, and responsive layout. I tested the form: submissions appeared in Supabase in real-time. For a non-developer who needs a functional lead page, this is a genuinely better answer.',
    },
  },
];"""

lovable_new = """    setupSteps: [
      'Sign up at lovable.dev \u2014 free plan gives 5 daily messages, no credit card. Subdomain deployment included instantly.',
      'Type a prompt: "Build a task manager with login, task list with due dates, and completion." Lovable generates the full React + Supabase app in under 2 minutes.',
      'Iterate by chat: "Add dark mode", "Make cards draggable". Each prompt refines the app without breaking prior functionality.',
      'Click Deploy to publish live. Connect GitHub for the full codebase. Custom domains on paid plans.',
    ],
    realOutputExample: {
      output: 'Prompt: Build a lead capture page for an AI newsletter with email form saved to a database. Result: deployed React page with Supabase-backed email form \u2014 live at a public URL in 4 minutes.',
      editorialNote: 'The generated page had working Tailwind styling, a Supabase form submission, and responsive layout. I tested the form: submissions appeared in Supabase in real-time. For a non-developer who needs a functional lead page, this is a genuinely better answer.',
    },
    dailyUseCases: [
      'Spinning up an internal admin tool: dashboard showing top affiliate links \u2014 connected to Supabase, deployed in under an hour.',
      'Prototyping a SaaS idea with real data persistence to show investors \u2014 no developer needed.',
      'Building newsletter landing pages with A/B variants: generate both, deploy both, split test.',
      'Creating client-facing project status portals from a single prompt per client.',
      'Replacing Webflow or Bubble \u2014 Lovable\\'s output is a real GitHub repo, not a locked format.',
    ],
  },
];"""

if lovable_old not in content:
    print("ERROR: lovable block not found")
    lp = content.find("slug: 'lovable', id: 'c3'")
    block = content[lp:lp+5000]
    sp = block.find('setupSteps')
    dp = block.find('dailyUseCases')
    rp = block.find('realOutputExample')
    print(f"  setupSteps:{sp}  dailyUseCases:{dp}  realOutputExample:{rp}")
    print("  setupSteps context:", repr(block[sp:sp+200]))
    exit(1)

content = content.replace(lovable_old, lovable_new, 1)
print("Lovable: shortened setupSteps + swapped order")

with open('constants.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify offsets
cp = content.find("slug: 'cursor', id: 'c2'")
cb = content[cp:cp+4100]
lp = content.find("slug: 'lovable', id: 'c3'")
lb = content[lp:lp+4100]
c_setup = cb.find('setupSteps:')
c_real  = cb.find('realOutputExample')
c_daily = cb.find('dailyUseCases')
l_setup = lb.find('setupSteps:')
l_real  = lb.find('realOutputExample')
l_daily = lb.find('dailyUseCases')
print(f"\nCursor  - setupSteps:{c_setup:4d}  realOutputExample:{c_real:4d}  dailyUseCases:{c_daily:4d}")
print(f"Lovable - setupSteps:{l_setup:4d}  realOutputExample:{l_real:4d}  dailyUseCases:{l_daily:4d}")
ok = all(0 < x < 4000 for x in [c_real, c_daily, l_real, l_daily])
print(f"\nAll realOutputExample+dailyUseCases within 4000: {'YES ✓' if ok else 'NO ✗'}")
if not ok:
    for name, val in [('C realOutputExample', c_real), ('C dailyUseCases', c_daily),
                      ('L realOutputExample', l_real), ('L dailyUseCases', l_daily)]:
        status = 'PASS' if 0 < val < 4000 else 'FAIL'
        print(f"  {status} {name}: {val}")


# ── Cursor: replace from setupSteps through end of entry ─────────────────
cursor_setup_start = "    setupSteps: [\n      'Download Cursor from cursor.com"
cursor_setup_end = "catches things code review fatigue misses.',\n    ],\n  },\n\n  // CODING\n  {\n    slug: 'lovable'"

s_pos = content.find(cursor_setup_start)
e_pos = content.find(cursor_setup_end)

if s_pos == -1 or e_pos == -1:
    print(f"ERROR: cursor block not found. s_pos={s_pos}, e_pos={e_pos}")
    exit(1)

cursor_replacement = """    setupSteps: [
      'Download Cursor from cursor.com — installs on macOS, Windows, Linux. First-run wizard migrates VS Code extensions, keybindings, and settings automatically.',
      'Open any project and press Tab. Cursor predicts your next line based on the full codebase context — noticeably more accurate than standard Copilot.',
      'Use Cmd+K (Mac) / Ctrl+K (Windows) to edit code with natural language. Highlight a function, describe the change, Cursor rewrites it inline in under 3 seconds.',
      'Open Composer (Cmd+Shift+I) for multi-file tasks. Describe changes across the project and Composer plans and executes them with diffs to review before accepting.',
    ],
    realOutputExample: {
      output: 'Cmd+K: Add JWT auth middleware, validate UUID param, return typed errors. Cursor rewrote a 40-line Express handler in 4 seconds. Compiled cleanly on first attempt.',
      editorialNote: 'Cursor Pro beats Copilot Chat on targeted refactors: Cmd+K understands full file context plus imported types — never breaks TypeScript types. Same Copilot Chat prompt missed UUID validation. Cursor caught it without being asked.',
    },
    dailyUseCases: [
      'Refactoring with Cmd+K — splits component into sub-components and hooks across files in under 30 seconds.',
      'Codebase chat: explain auth flow from login to protected route — reads every relevant file.',
      'Unit tests via Composer: describe edge cases, Composer generates parametrized tests.',
      'Bug fixing: paste stack trace, ask what is causing this — finds root cause file-by-file.',
      'PR review: are there security issues or missed edge cases — catches things fatigue misses.',
    ],
  },

  // CODING
  {
    slug: 'lovable'"""

end_pos = e_pos + len(cursor_setup_end)
content = content[:s_pos] + cursor_replacement + content[end_pos:]
print(f"Cursor block replaced.")

# ── Lovable: replace from setupSteps through ]; ───────────────────────────
lovable_setup_start = "    setupSteps: [\n      'Sign up at lovable.dev"
lovable_setup_end = "Lovable\\'s output is cleaner code with a real GitHub repo instead of a locked proprietary format.',\n    ],\n  },\n];"

s2_pos = content.find(lovable_setup_start)
e2_pos = content.find(lovable_setup_end)

if s2_pos == -1 or e2_pos == -1:
    print(f"ERROR: lovable block not found. s2_pos={s2_pos}, e2_pos={e2_pos}")
    # Debug
    lp = content.find("slug: 'lovable', id: 'c3'")
    block = content[lp:lp+5000]
    sp = block.find('setupSteps')
    print(f"  In lovable block: setupSteps at {sp}")
    if sp != -1:
        print("  setupSteps context:", repr(block[sp:sp+100]))
    exit(1)

lovable_replacement = """    setupSteps: [
      'Sign up at lovable.dev — free plan gives 5 daily messages, no credit card. Get a subdomain deployment instantly.',
      'Type a prompt: "Build a task manager with login page, task list with due dates, and completion toggles." Lovable generates the full React + Supabase app in under 2 minutes.',
      'Iterate by chat: "Add dark mode", "Make cards draggable". Each prompt refines the app without breaking prior functionality.',
      'Click Deploy to publish live. Connect GitHub for the full codebase. Custom domains on paid plans.',
    ],
    realOutputExample: {
      output: 'Prompt: Build a lead capture page for an AI newsletter with email form saved to a database. Result: deployed React page with Supabase-backed email form — live at a public URL in 4 minutes.',
      editorialNote: 'The generated page had working Tailwind styling, a Supabase form submission, and responsive layout. I tested the form: submissions appeared in Supabase in real-time. For a non-developer who needs a functional lead page, this is a genuinely better answer.',
    },
    dailyUseCases: [
      'Admin tools: dashboard showing top affiliate links connected to Supabase — deployed in under an hour.',
      'Prototype a SaaS demo with real data persistence to show investors — no developer needed.',
      'Newsletter landing pages with A/B variants: generate both, deploy both, split test.',
      'Client status portals: each client gets a unique page from a single prompt.',
      'Replace Webflow/Bubble — Lovable\\'s output is a real GitHub repo, not a locked format.',
    ],
  },
];"""

end2_pos = e2_pos + len(lovable_setup_end)
content = content[:s2_pos] + lovable_replacement + content[end2_pos:]
print(f"Lovable block replaced.")

with open('constants.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. Verifying offsets...")

# Verify
cp = content.find("slug: 'cursor', id: 'c2'")
cb = content[cp:cp+4100]
lp = content.find("slug: 'lovable', id: 'c3'")
lb = content[lp:lp+4100]
c_setup = cb.find('setupSteps:')
c_daily = cb.find('dailyUseCases')
c_real  = cb.find('realOutputExample')
l_setup = lb.find('setupSteps:')
l_daily = lb.find('dailyUseCases')
l_real  = lb.find('realOutputExample')
print(f"Cursor  - setupSteps:{c_setup:4d}  realOutputExample:{c_real:4d}  dailyUseCases:{c_daily:4d}")
print(f"Lovable - setupSteps:{l_setup:4d}  realOutputExample:{l_real:4d}  dailyUseCases:{l_daily:4d}")
ok = all(0 < x < 4000 for x in [c_setup, c_daily, c_real, l_setup, l_daily, l_real])
print(f"All within 4000 chars: {'YES' if ok else 'NO'}")
if not ok:
    print(f"  Cursor  - {'PASS' if c_real < 4000 else 'FAIL'} realOutputExample  {'PASS' if c_daily < 4000 else 'FAIL'} dailyUseCases")
    print(f"  Lovable - {'PASS' if l_real < 4000 else 'FAIL'} realOutputExample  {'PASS' if l_daily < 4000 else 'FAIL'} dailyUseCases")

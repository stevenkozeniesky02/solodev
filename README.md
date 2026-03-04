# solodev

**Your entire product pipeline in one terminal.**

solodev is an interactive CLI that wraps [Claude Code](https://claude.ai/code) with the [Solo Dev Toolbox](https://github.com/stevenkozeniesky02/claude-plugins) — 18 plugins, 89 AI agents, and a persistent session that remembers every decision from idea validation through legal compliance.

No API keys. No context switching. Just your Claude subscription and a terminal.

```
┌─────────────────────────────────────────────────┐
│  my-saas-app                ~/projects/saas      │
├─────────────────────────────────────────────────┤
│                                                   │
│  Pipeline:                                        │
│                                                   │
│  ✅  1. Idea Validation       /spark     .spark/  │
│  ✅  2. Tech Stack             /stack     .stack/  │
│  ✅  3. Scaffold               /scaffold  .scaffold│
│  ✅  4. Roadmap                /generate  .roadmap/│
│  🔨  5. Build                  /build     .build/  │
│  ⬚   6. Test Coverage          /coverage           │
│  ⬚   7. Dependencies           /checkup            │
│  ⬚   8. Production Readiness   /preflight          │
│  ⬚   9. Cost Forecast          /estimate           │
│  ⬚  10. Scale Analysis         /simulate           │
│  ⬚  11. Incident Runbooks      /runbook            │
│  ⬚  12. Landing Page           /landing            │
│  ⬚  13. Pricing Strategy       /pricing            │
│  ⬚  14. Pitch Deck             /pitch              │
│  ⬚  15. Legal & Compliance     /comply             │
│                                                   │
│  → Continue building? (milestone 2)               │
│                                                   │
│  [Enter] Run next  [↑↓] Select step  [v] View    │
│  [s] Settings  [p] Projects  [q] Quit             │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Why solodev?

The Solo Dev Toolbox has 18 plugins and 18 slash commands. That's powerful — but it also means remembering commands, flags, output directories, and the right order to run things. And every time you start a new Claude Code session, the context resets.

solodev solves both problems:

- **Visual pipeline** — See every step at a glance. Know exactly what's done, what's running, and what's next.
- **Persistent context** — One session per project. When you run `/pitch`, Claude already knows your tech stack from `/stack`, your costs from `/estimate`, and your market from `/spark`. By step 15, Claude has the *entire* product history.
- **Two modes** — Interactive TUI for exploration, direct commands for speed. Both share the same session.
- **Zero config** — Authenticate with your existing Claude subscription. No API keys. No `.env` files.

---

## Install

```bash
npm install -g solodevproject
```

**Prerequisites:**
- [Node.js](https://nodejs.org/) 18+
- [Claude Code](https://claude.ai/code) installed and authenticated (`claude login`)
- A Claude Pro or Max subscription

---

## Usage

### Interactive TUI

```bash
solodev
```

The TUI walks you through four screens:

**1. Authentication** — Verifies your Claude Code connection. Shows your email and plan. Auto-advances if already logged in.

```
   ███████╗ ██████╗ ██╗      ██████╗
   ██╔════╝██╔═══██╗██║     ██╔═══██╗
   ███████╗██║   ██║██║     ██║   ██║
   ╚════██║██║   ██║██║     ██║   ██║
   ███████║╚██████╔╝███████╗╚██████╔╝
   ╚══════╝ ╚═════╝ ╚══════╝ ╚═════╝  DEV

   ✅ steven@gmail.com (Max plan)

   Press Enter to continue
```

**2. Project Select** — Choose an existing project or create a new one. Shows pipeline progress for each.

```
  Your Projects:

  > my-saas-app       ~/projects/saas    6 steps
    osint-engine      ~/osint-engine     2 steps
    side-project      ~/code/sidething   new

  [n] New project   [o] Open existing directory   [q] Quit
```

**3. Dashboard** — The pipeline view. Arrow keys to navigate, Enter to run, `v` to view completed output. Smart suggestions highlight what to do next.

**4. Run View** — Real-time execution with an elapsed timer. Space toggles a collapsible live output stream. `c` to cancel.

```
  Running: /coverage                    ◐ 1m 23s

  ─────────── Live Output ─────────────────────
  > Scanning src/api/ for untested endpoints...
  > Found 23 source files, 8 test files
  > Coverage ratio: 34% (8/23 modules)

  [Space] Collapse  [c] Cancel
```

### Direct Commands

Skip the TUI entirely. Run any plugin command straight from your terminal:

```bash
# Run a plugin
solodev spark "AI-powered code review tool"
solodev coverage --generate-skeletons
solodev pitch --stage pre-seed

# Check pipeline status
solodev status

# Reset session (keep outputs)
solodev reset

# Reset everything (delete all outputs)
solodev reset --hard
```

Direct commands share the same persistent session as the TUI. Run `solodev spark` in the morning, `solodev status` in the afternoon, and `solodev pitch` at night — Claude remembers it all.

---

## How It Works

### Session Persistence

solodev assigns a unique Claude Code session ID to each project. Every plugin run resumes that same session:

```
Run 1:  /spark    → Claude knows the idea
Run 2:  /stack    → Claude knows idea + stack decision
Run 3:  /scaffold → Claude knows idea + stack + project structure
...
Run 15: /comply   → Claude has the ENTIRE product history
```

This means `/pricing` automatically factors in your infrastructure costs from `/estimate`. `/pitch` pulls your market research from `/spark` and financial data from `/estimate`. `/comply` scans the actual data flows it watched you build. No copy-pasting between tools.

### Pipeline State Detection

solodev doesn't store duplicate state. It scans your project directory for dot-directories:

| Directory exists? | `state.json` status | Pipeline shows |
|---|---|---|
| No | — | ⬚ Not started |
| Yes | `"in_progress"` | 🔨 In progress |
| Yes | `"complete"` or missing | ✅ Complete |

The plugins are the single source of truth.

### Architecture

```
┌─────────────────────────────────────────────────┐
│                   solodev TUI                    │
│          (Ink + React terminal components)        │
├─────────────────────────────────────────────────┤
│               Orchestration Layer                │
│  ┌───────────┐  ┌───────────┐  ┌─────────────┐ │
│  │  Project   │  │  Pipeline │  │   Session    │ │
│  │  Manager   │  │  Tracker  │  │   Store      │ │
│  └───────────┘  └───────────┘  └─────────────┘ │
├─────────────────────────────────────────────────┤
│              Claude Code Subprocess              │
│   claude -p "prompt" --resume SESSION_ID         │
│     --plugin-dir ./plugins                       │
│     --output-format stream-json                  │
├─────────────────────────────────────────────────┤
│              Bundled Plugins (18)                 │
│   spark, stack, scaffold, generate, build, ...   │
└─────────────────────────────────────────────────┘
```

solodev spawns Claude Code as a subprocess — not via the API. This means:
- **No API keys** — uses your existing Claude subscription (Pro/Max)
- **Full plugin support** — all 18 plugins load via `--plugin-dir`
- **Real-time streaming** — `--output-format stream-json` for the live view
- **Session resume** — `--resume SESSION_ID` restores full conversation history

---

## The 15-Step Pipeline

| # | Step | Command | What It Does |
|---|------|---------|-------------|
| 1 | Idea Validation | `/spark` | Market research, competitive analysis, feasibility, go/no-go |
| 2 | Tech Stack | `/stack` | Framework comparison, cost analysis, stack recommendation |
| 3 | Scaffold | `/scaffold` | Project skeleton with CI/CD, Docker, linting, docs |
| 4 | Roadmap | `/generate` | Phased roadmap with dependency tracking from codebase analysis |
| 5 | Build | `/build` | TDD multi-agent coding, milestone by milestone |
| 6 | Test Coverage | `/coverage` | Risk-ranked coverage gaps with optional test skeletons |
| 7 | Dependencies | `/checkup` | CVE scan, freshness, license audit, bloat detection |
| 8 | Production Readiness | `/preflight` | 50+ checks with GO/NO-GO scorecard |
| 9 | Cost Forecast | `/estimate` | Infra + API costs at 100/1K/10K/100K users |
| 10 | Scale Analysis | `/simulate` | Bottleneck hunting at 10x/100x/1000x |
| 11 | Incident Runbooks | `/runbook` | Failure modes, severity classification, response procedures |
| 12 | Landing Page | `/landing` | Conversion-optimized copy + optional responsive HTML |
| 13 | Pricing Strategy | `/pricing` | Competitive analysis, unit economics, tier design |
| 14 | Pitch Deck | `/pitch` | Sequoia/YC-format deck, one-pager, elevator pitches |
| 15 | Legal & Compliance | `/comply` | Privacy policy, terms, cookie policy with GDPR/CCPA gaps |

The pipeline is not locked to sequential order. Jump to any step. The smart suggestion just highlights what makes sense next.

Three utility plugins (`/discover`, `/autopsy`, `/onboard`) are bundled but not in the main pipeline — they're available for existing codebases that don't need the full idea-to-ship flow.

---

## Configuration

solodev stores config in `~/.config/solodev/` (XDG-compliant):

```
~/.config/solodev/
├── config.json      # Global settings
└── projects.json    # Project registry with session IDs
```

### Global Config

```json
{
  "version": 1,
  "pluginDir": null,
  "defaultPermissionMode": "default",
  "editor": null
}
```

- `pluginDir` — Override bundled plugins with a custom directory
- `defaultPermissionMode` — `"default"`, `"acceptEdits"`, or `"bypassPermissions"`

### Per-Project Settings

Each project tracks its own permission mode and session ID. Change permissions per project from the TUI settings.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript (ESM) |
| TUI Framework | [Ink](https://github.com/vadimdemedes/ink) (React for CLI) |
| CLI Parser | [Commander](https://github.com/tj/commander.js) |
| Terminal Components | ink-select-input, ink-text-input, ink-spinner |
| Config | XDG-compliant JSON files |
| Session IDs | UUID v4 |
| Runtime | Node.js 18+ |

---

## Development

```bash
git clone https://github.com/stevenkozeniesky02/solodev.git
cd solodev
npm install
npm run build    # Bundles plugins + compiles TypeScript
npm test         # 17 tests across 4 suites
npm link         # Install globally for testing
```

The build step copies all 18 plugins from the sibling `claude-plugins` repo into `plugins/`. To use a different plugin source, set `pluginDir` in the global config.

---

## License

MIT

## Author

Steven Kozeniesky

## Links

- [Solo Dev Toolbox](https://github.com/stevenkozeniesky02/claude-plugins) — The 18 plugins that power solodev
- [Claude Code](https://claude.ai/code) — The AI engine underneath

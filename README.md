# solodev

Interactive CLI for the Solo Dev Toolbox — 18 plugins, one pipeline, persistent context.

## Install

```bash
npm install -g solodev
```

Requires [Claude Code](https://claude.ai/code) installed and authenticated.

## Usage

```bash
# Interactive TUI
solodev

# Direct commands
solodev spark "AI-powered code review tool"
solodev status
solodev coverage --generate-skeletons
solodev reset
```

## How It Works

solodev wraps Claude Code with a persistent session per project. Every plugin run resumes the same conversation, so context accumulates across your entire pipeline.

See the [Solo Dev Toolbox](https://github.com/stevenkozeniesky02/claude-plugins) for the full plugin suite.

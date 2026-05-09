# ai-obsidian-plugion

A small Obsidian plugin that provides AI-assisted note-taking features (summaries, prompts, completions) directly inside the vault.

## Features
- Generate summaries for a note or selection
- Create suggested titles and tags
- Insert AI-composed content via command palette
- Configurable model, max tokens, and temperature
- Simple keyboard shortcuts and command palette integration

## Prerequisites
- Obsidian (v1.0+)
- Node.js & npm (for development)
- Valid AI API key configured in plugin settings

## Installation
1. Drop the built plugin folder into:
    `.obsidian/plugins/ai-obsidian-plugion`
2. Open Obsidian → Settings → Community plugins → Enable `ai-obsidian-plugion`.
3. Open plugin settings to add your API key and tune options.

## Usage
- Command palette: “AI: Summarize note”, “AI: Suggest title”, “AI: Generate content”
- Select text and run “AI: Summarize selection” to get a brief summary inserted as a block.
- Configure default prompt templates in Settings.

## Settings (examples)
- API Key: your provider key
- Model: gpt-like-model
- Max tokens: 512
- Temperature: 0.2
- Default prompt templates: summary, expand, title-suggest

## Troubleshooting
- No response: check API key and network connectivity.
- Rate limit errors: reduce request frequency or tokens.
- Permission issues: ensure plugin folder and files are readable by Obsidian.

## Contributing
- Fork the repo, create feature branches, open pull requests.
- Follow existing code style and include tests for new features.

## License
MIT — see LICENSE file for details.
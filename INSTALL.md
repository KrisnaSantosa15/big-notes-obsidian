# Install on OpenCode

```bash
# After running `bash scripts/build.sh --platform opencode`:
cp -R dist/opencode/. /path/to/your/vault/
```

Then in your vault:

- `AGENTS.md` is the operating manual OpenCode reads at session start.
- `.opencode/commands/*.md` are the command bodies the AI follows.
- `.opencode/scripts/` holds the Python helpers.

## Run on Hermes / open models

OpenCode is model-agnostic, so these commands run on any model you point it at,
including open models like Nous Research Hermes. No build changes needed - set
the model on OpenCode's side. Authenticate OpenRouter (`/connect`, or
`export OPENROUTER_API_KEY=...`), then in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openrouter/nousresearch/hermes-4-70b",
  "provider": { "openrouter": { "models": { "nousresearch/hermes-4-70b": {} } } }
}
```

Use `nousresearch/hermes-4-405b` for the synthesis-heavy commands, or
`nousresearch/hermes-3-llama-3.1-405b:free` for a zero-cost trial. For full
privacy, run a smaller Hermes locally via Ollama / LM Studio. Core commands
(save, daily, capture, find, task, free-mode research) hold up well on open
models; the deep-synthesis commands prefer a stronger instruction-follower.

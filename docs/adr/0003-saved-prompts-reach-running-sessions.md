# Saved prompts reach running sessions

A mode whose prompt was edited uses a live persona row that reads the mode's latest saved prompt each time the system prompt is assembled, so a saved prompt reaches sessions already running in that mode on their next step, not only new sessions. DSH records the change in the session log. On routes that accept later system messages it appends the new prompt after the cached history, so the cached prefix still hits; on other routes it rewrites the first system message, which costs that session's prompt cache. Only the prompt's start and end text work this way; the full-prompt and runtime-context switches reach new sessions only.

## Considered Options

- **New sessions only** (DSH's default): an edit would seem to do nothing in the conversation the user is testing it in.

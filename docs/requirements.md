# Requirements

What Mode Manager must do, and how each part was verified. This is the one place the requirements live: a feature's spec under `.scratch/<feature>/` is folded in here when the feature is done. Terms follow [GLOSSARY.md](../GLOSSARY.md); the reasons behind the design are in [docs/adr/](adr/).

## Who it is for

People who want DSH's agent modes to fit their work: a mode that cannot run commands, a different system prompt, clearer tool descriptions, or skills that only some modes load. In DSH itself that means editing the profile's YAML by hand, row by row, with plugin names instead of capabilities.

## Goals

- See what each mode can do, and switch capabilities instead of plugins.
- Edit each mode's system prompt and tool descriptions, with history and a way back to the built-in text.
- Turn skills on or off per mode, pin versions, and create and import skills.
- Create modes from templates or copies.
- Keep edited modes in step with DSH's built-in updates.

## Out of scope

- Changing any file in DSH's installation: every change is a profile override ([ADR 0001](adr/0001-edits-are-profile-overrides.md)).

## Constraints

- Every feature it has stays, also now that Skill Manager exists.
- It and Skill Manager are independent and work together; when both are installed, per-mode skill settings are Mode Manager's.
- After an uninstall, every mode it changed keeps working.
- The page follows DSH's language and has every text in Chinese and English.
- The page can check for a newer release and upgrade the plugin.
- When the page fails to draw, it shows the error text and Reload, never an empty section.
- It works on Windows, macOS, and Linux, on Node `^22.19.0 || >=24`.
- The README and market text claim only what was verified.

## Features

Verified items were checked on DSH versions installed into an isolated `DSH_HOME`; requests were checked through DSH's own local mock model and a proxy that records requests.

### The mode list

**Acceptance criteria**

- Each mode is a card with its name, description, capabilities, status, and actions (new session, make default, duplicate, view configuration, edit details, restore built-in, delete).
- A card shows one notice, with a button that fixes it, when the mode needs attention.

### Capabilities

**Acceptance criteria**

- Each mode offers one switch per capability; turning one on restores it as the built-in mode has it, and turning it off switches off every plugin it includes.
- A capability with only some of its plugins on is marked Partly on; capabilities the mode has no plugins for are hidden.

**Verified**

- The Read-only research mode sends no tool that writes files, edits files, or runs commands.

### Prompt

**Acceptance criteria**

- Each mode's system prompt can be edited with variables checked as you type, a preview of the full prompt, a closing prompt, and the advanced switches.
- Every save records a version (up to 30) that can be loaded back; prompts import and export as `.md`.
- Unsaved edits survive a page refresh, and a prompt changed elsewhere meanwhile is not overwritten without asking.
- Restoring the built-in prompt asks first.

### Live prompt and prompt changes in chat

**Acceptance criteria**

- With Live prompt on, a saved prompt reaches running sessions of that mode from their next step ([ADR 0003](adr/0003-saved-prompts-reach-running-sessions.md)).
- With prompt changes in chat allowed, the model reads and changes the prompt through `mode_prompt`, and every change asks for approval first.

**Verified**

- With Live prompt on, the next request of the same session carried the new prompt.
- When the model called `mode_prompt`, the interface asked for approval, and after approval the next request carried the changed prompt.

### Tool descriptions

**Acceptance criteria**

- The description of any tool a mode registers can be rewritten, for one mode or several at once; a tool's name and parameters never change.
- One tool, one mode, everything in the ticked modes, or everything can be restored to the built-in text, each after asking.
- A tool whose built-in description changed after a DSH upgrade is marked, and the edit keeps applying.

**Verified**

- A new session of an edited mode sent the edited text for exactly the edited tools, a running session sent a later edit with its next request, and after a restore the next request carried the built-in text again; checked on `0.2.0-rc.2` and `0.2.1-rc.1`.

### Skills per mode

**Acceptance criteria**

- Each skill can be turned on or off per mode or in every mode, and a mode can be pinned to a saved version of a skill.
- Versions can be saved with a note, viewed, restored, and deleted; editing or restoring saves the current file first, and a version in use cannot be deleted.
- Switching and pinning never move skill files; skills inside `node_modules` cannot be edited or restored.

**Verified**

- In a new Standard session a skill turned off was missing from the catalog; a pinned skill showed the saved version's description and its loaded instructions were the saved body while the file held an edit; a skill turned off in every mode disappeared from a running session's next request; restoring a version brought the file back after saving the edited one. Checked on `0.2.0-rc.2` and `0.2.1-rc.1`.

### Creating and importing skills

**Acceptance criteria**

- A new skill is written to `~/.dsh/skills` or `~/.agents/skills`, on only in the modes chosen for it.
- Skills in Codex, Claude Code, Claude Code plugins, or a named folder can be imported as copies; a clash is imported under a new name or replaces the skill after a version is saved.
- An imported skill whose source changes is marked and can be imported again.

**Verified**

- On `0.2.1-rc.2` (npm) and `0.2.1-rc.1` (source), with sample skills in Codex, Claude Code, a Claude Code plugin, and a folder, the import list showed each status, copies were written under new names where needed with the copied `name` rewritten, every mode's skill catalog (`skills.snapshot`) listed the new skills, a new skill left out of one mode was off there, and a changed source was flagged and imported again after a version was saved.
- Not yet verified through model requests: a running session picking up a new skill.

### All plugins

**Acceptance criteria**

- Every plugin in a mode can be searched, switched (Auto, On, or Off where it switches by environment), restored one by one, and inspected.

### New modes

**Acceptance criteria**

- A mode can be created from the Develop, Write, Chat, or Read-only research template, or by copying a mode; each template comes with a starter prompt in the interface language.

### Keeping up with DSH upgrades

**Acceptance criteria**

- After a DSH upgrade, an edited mode shows that the built-in mode was updated, lists what changed upstream, and merges it on confirmation, keeping the user's changes ([ADR 0002](adr/0002-built-in-updates-are-merged-three-ways.md)).
- When a plugin in a mode fails to load, the failing plugins can be turned off in one click.
- Deleting a custom mode first says how many open and saved sessions use it.

### Modes keep working after an uninstall

**Acceptance criteria**

- After the plugin is removed, every mode it changed still loads and starts sessions.
- Installing it again brings back every setting.

**Verified**

- On `0.2.1-rc.2`, Standard was given skill settings, Live prompt with an edited prompt, `mode_prompt`, and a tool description edit. After `dsh plugin remove` and with the package files gone, Standard was still in the mode list, a new session started, the plugin's rows were off, and the assembled prompt carried the edited text once. Installing again brought every setting back.
- A Standard override saved by 0.8.0 got its conditions on the first start. Without the conditions, the same uninstall leaves Standard out of the mode list and a new session fails with `agent-preset/invalid`.

### Updating the plugin

**Acceptance criteria**

- The page says when a newer release is out and installs it through DSH's plugin manager after the user confirms ([ADR 0004](adr/0004-plugin-updates-itself-through-dsh-plugin-manager.md)).
- Only the `latest` release is offered, and its tarball address must be this package's file on the registry that answered.
- The automatic check can be turned off; a development install is never checked.

**Verified**

- A build labelled `0.5.0` found the real latest release on npm and upgraded to it through DSH's installer. The dependency became the registry tarball address and the plugin stayed enabled. `0.2.0-rc.2` asked for a restart, and `0.2.1-rc.1` replaced the plugin on the spot.
- The same kind of install from the Plugins page was checked across a restart: a custom mode created before the upgrade still worked. A failed install left the manifest, lockfile, and files as they were.
- The latest-release answers of npm and of the China mirror pass the tarball address check. The switch, the manual check, and the development install were checked in the page.

### When the page fails

**Acceptance criteria**

- When the page throws while drawing, it shows the error text and a Reload button that loads the page again.

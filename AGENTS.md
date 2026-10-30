# AGENTS.md

Mode Manager (`dsh-modes`) is a plugin for DeepSeek Harness (DSH). [README.md](README.md) says what it does for users; [docs/requirements.md](docs/requirements.md) holds what it must do and how each part was verified; [docs/adr/](docs/adr/) holds why it is built the way it is; [GLOSSARY.md](GLOSSARY.md) holds the words to use.

## Rules

- The maintainer runs `npm login` and `npm publish`; never enter npm credentials or one-time codes.
- Do not push, publish, or open pull requests unless the maintainer asks for it.
- Before calling a change done, run the tests on the current Node and on Node 22.19, the oldest supported:

  ```sh
  npm test
  npx --yes node@22.19.0 --test "test/*.test.js"
  ```

- Documents come in pairs, `X.md` in English and `X.zh.md` in Chinese, kept paragraph for paragraph and changed in the same commit: the README, `GLOSSARY`, `docs/requirements`, and every ADR.
- A change a user can notice updates `docs/requirements` (its acceptance criteria, and what was verified) and the README in the same commit.
- Record each change a user can notice under `## Unreleased` in `CHANGELOG.md`, creating the file with the first such change; earlier versions are in the git history and the version tags.
- Never commit the `scripts/` folder; it stays untracked on purpose.
- A feature's spec lives in `.scratch/<feature>/` while the feature is open. When it is done, fold its lasting requirements into `docs/requirements` and delete the folder, in the same commit.

## Agent skills

### Issue tracker

Specs and tickets live as markdown files under `.scratch/` in this repo; GitHub Issues stay open for users. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

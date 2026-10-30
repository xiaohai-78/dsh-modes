# The page is one file with no build step

The page is one `client.js` that DSH's module loader runs as it is: React through `React.createElement` without JSX, no bundler, and the Chinese and English text in two dictionaries inside the file. The plugin then runs exactly as published, with no build output to commit or forget, and a test can read the file to check that both languages have every key the page uses. dsh-modes, dsh-mode-skills, and dsh-request-params keep this layout the same.

## Considered Options

- **JSX with a bundler**: shorter page code, but every release would depend on a build step and its output matching the source.

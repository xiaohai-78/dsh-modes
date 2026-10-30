import assert from 'node:assert/strict'
import { access, readdir, readFile } from 'node:fs/promises'
import { join, posix } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
// A Windows checkout may turn line endings into CRLF.
const read = async path => (await readFile(join(root, path), 'utf8')).replace(/\r\n/g, '\n')
const manifest = JSON.parse(await read('package.json'))
const adrs = (await readdir(join(root, 'docs', 'adr'))).filter(name => name.endsWith('.md')).sort()
/** The documents kept in English (`X.md`) and Chinese (`X.zh.md`). */
const pairs = ['README', 'GLOSSARY', 'docs/requirements', ...adrs.filter(name => !name.endsWith('.zh.md')).map(name => `docs/adr/${name.slice(0, -'.md'.length)}`)]

/** The heading levels of a Markdown text in order, leaving out code blocks. */
function headings(text) {
  const levels = []
  let fenced = false
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced
    else if (!fenced && /^#{1,6} /.test(line)) levels.push(line.indexOf(' '))
  }
  return levels
}

test('every document has its Chinese twin with the same headings', async () => {
  for (const base of pairs) assert.deepEqual(headings(await read(`${base}.zh.md`)), headings(await read(`${base}.md`)), base)
})

test('ADRs are numbered from 0001 without gaps, the same in both languages', () => {
  const english = adrs.filter(name => !name.endsWith('.zh.md'))
  assert.ok(english.length > 0)
  assert.deepEqual(english.map(name => name.slice(0, 4)), english.map((_, at) => String(at + 1).padStart(4, '0')))
  assert.deepEqual(adrs.filter(name => name.endsWith('.zh.md')).map(name => name.replace(/\.zh\.md$/, '.md')), english)
})

test('every feature in the requirements has acceptance criteria', async () => {
  for (const [file, features, marker] of [['docs/requirements.md', 'Features', '**Acceptance criteria**'], ['docs/requirements.zh.md', '功能', '**验收标准**']]) {
    const part = (await read(file)).split(/\r?\n## /).find(section => section.startsWith(`${features}\n`))
    assert.ok(part !== undefined, `${file} has a ${features} section`)
    const sections = part.split(/\r?\n### /).slice(1)
    assert.ok(sections.length > 0, file)
    for (const section of sections) assert.ok(section.includes(marker), `${file}: ${section.split(/\r?\n/)[0]}`)
  }
})

test('the newest version in the changelog is the package version', async (t) => {
  let text
  try {
    text = await read('CHANGELOG.md')
  } catch {
    // A plugin starts its changelog with its first change after this check was added.
    t.skip('no changelog yet')
    return
  }
  const newest = /^## (\d+\.\d+\.\d+)/m.exec(text)
  if (newest !== null) assert.equal(newest[1], manifest.version)
})

test('relative links in the documents lead to files that exist', async () => {
  const documents = ['AGENTS.md', ...pairs.flatMap(base => [`${base}.md`, `${base}.zh.md`])]
  for (const document of documents) {
    for (const [, target] of (await read(document)).matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(?:[a-z]+:|#)/i.test(target)) continue
      const path = posix.normalize(posix.join(posix.dirname(document), target.split('#')[0]))
      await assert.doesNotReject(access(join(root, path)), `${document} links to ${target}`)
    }
  }
})

test('the documents stay out of the published package', () => {
  for (const entry of manifest.files) assert.ok(!/^(?:docs|GLOSSARY|AGENTS|\.scratch)\b/.test(entry), entry)
})

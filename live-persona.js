/**
 * A persona row whose prompt text is read from its mode's latest saved
 * configuration each time the system prompt is assembled, so a saved prompt
 * reaches sessions already running in this mode on their next model step.
 *
 * It replaces the `@deepseek-ai/dsh-persona` row of one mode and registers the
 * same two sections that row does. `config.preset` names the mode whose saved
 * persona text is read; the row's own `prefix` and `suffix` are the fallback when
 * that mode or the manager is unavailable. `complete` and `includeRuntimeContext`
 * are fixed for each revision, like the official row: changing them reaches new
 * sessions only. The agent loop records every system prompt change in the session
 * log; on routes that accept later system messages it appends the new prompt after
 * the cached history, and elsewhere it rewrites the first system message, which
 * costs that session's prompt cache.
 */

/** Section names `@deepseek-ai/dsh-system-prompt` exports as PERSONA_PREFIX_SECTION and PERSONA_SUFFIX_SECTION. */
const PREFIX_SECTION = 'deployment:persona-prefix'
const SUFFIX_SECTION = 'deployment:persona-suffix'

export const name = 'dsh-modes-live-persona'
export const inject = ['systemPrompt']

export function apply(ctx, config) {
  let warned = false
  const saved = () => {
    try {
      return ctx.get('dshModes')?.persona(config.preset)
    } catch (error) {
      if (!warned) ctx.logger.warn(`live prompt for ${String(config.preset)} fell back to the session's revision: ${error instanceof Error ? error.message : String(error)}`)
      warned = true
      return undefined
    }
  }
  const text = field => () => {
    const value = saved()?.[field]
    return typeof value === 'string' ? value : typeof config[field] === 'string' ? config[field] : ''
  }
  ctx.effect(() => ctx.systemPrompt.section({
    name: PREFIX_SECTION,
    order: ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
    text: text('prefix'),
    ...config.complete === true ? { complete: true } : {},
  }), 'dsh-modes: live persona prefix')
  ctx.effect(() => ctx.systemPrompt.section({
    name: SUFFIX_SECTION,
    order: ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_SUFFIX'),
    text: text('suffix'),
  }), 'dsh-modes: live persona suffix')
  if (config.includeRuntimeContext === false) ctx.systemPrompt.suppressRuntimeContext()
}

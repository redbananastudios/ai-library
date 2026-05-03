/**
 * Strip Portable Text to plain text for llms-full.txt.
 *
 * Loose typing on purpose — Portable Text shapes vary by schema; we
 * only need the text content of normal blocks for LLM consumption.
 */

type Span = { _type?: string; text?: string }
type Block = { _type?: string; children?: Span[] }

export const portableTextToPlain = (input: unknown): string => {
  if (!Array.isArray(input)) return ''
  const blocks = input as Block[]
  const out: string[] = []
  for (const b of blocks) {
    if (b?._type !== 'block') continue
    const text = (b.children ?? [])
      .filter((s) => s?._type === 'span')
      .map((s) => s.text ?? '')
      .join('')
    if (text.trim().length) out.push(text)
  }
  return out.join('\n\n')
}

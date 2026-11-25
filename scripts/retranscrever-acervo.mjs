#!/usr/bin/env node
// Reprocessa transcrições do acervo com Claude, por faixas de páginas.
//
// Por padrão é SIMULAÇÃO: grava os Markdown em --out e não altera o banco.
// Só com --apply (e SUPABASE_SERVICE_KEY) grava em documents.content_markdown.
//
// Uso (na raiz do projeto, depois de npm install):
//   ANTHROPIC_API_KEY=... SUPABASE_URL=... SUPABASE_KEY=<anon/publishable> \
//     node scripts/retranscrever-acervo.mjs --truncated --out ./retranscricoes
//
//   # gravar no banco depois de conferir a amostra:
//   ANTHROPIC_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_KEY=... \
//     node scripts/retranscrever-acervo.mjs --truncated --out ./retranscricoes --apply
//
// Seleção (combináveis): --slug a,b,c | --truncated | --missing | --all | --limit N
// Outros: --model claude-sonnet-5-5 | --concurrency 4 | --pdf-dir ./pdfs (cache local)

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { extractText } from 'unpdf'
import {
  countPdfPages, extractPdfPages, planChunks, transcribePdfRange, joinChunks, DEFAULT_OCR_MODEL
} from '../server/lib/transcription-core.mjs'

// Preços por milhão de tokens (entrada, saída), tabela pública da Anthropic em 2026-11
const PRICES = {
  'claude-haiku-5-5': [0.10, 0.50],
  'claude-sonnet-5-5': [2, 10],
  'claude-opus-5-5': [4, 20]
}

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const READ_KEY = SERVICE_KEY || process.env.SUPABASE_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const APPLY = flag('apply')
const MODEL = opt('model', process.env.ANTHROPIC_OCR_MODEL || DEFAULT_OCR_MODEL)
const CONCURRENCY = Number(opt('concurrency', '4'))
const OUT = opt('out', './retranscricoes')
const PDF_DIR = opt('pdf-dir', join(OUT, '_pdfs'))
const LIMIT = Number(opt('limit', '0'))

if (!SUPABASE_URL || !READ_KEY || !ANTHROPIC_API_KEY) {
  console.error('Defina SUPABASE_URL, SUPABASE_KEY (ou SUPABASE_SERVICE_KEY) e ANTHROPIC_API_KEY.')
  process.exit(1)
}
if (APPLY && !SERVICE_KEY) {
  console.error('--apply exige SUPABASE_SERVICE_KEY.')
  process.exit(1)
}

const rest = async (path, init = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: READ_KEY, Authorization: `Bearer ${READ_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) }
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

const getPdf = async (doc) => {
  await mkdir(PDF_DIR, { recursive: true })
  const path = join(PDF_DIR, `${doc.id}.pdf`)
  try { if ((await stat(path)).size > 0) return new Uint8Array(await readFile(path)) } catch {}
  const res = await fetch(doc.file_url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  await writeFile(path, bytes)
  return bytes
}

/** Heurística de texto cortado: comparado com a camada de texto do PDF ou, em escaneados, pelo fim abrupto. */
const looksTruncated = async (doc, bytes) => {
  const md = doc.content_markdown || ''
  if (!md.trim()) return true
  let layer = 0
  try {
    const { text } = await extractText(bytes.slice(), { mergePages: true })
    layer = String(text).replace(/\s+/g, ' ').trim().length
  } catch {}
  if (layer > 500) return md.length / layer < 0.85
  return md.length >= 20000 && !/[.!?"”»)*]$/.test(md.trimEnd())
}

const transcribeDoc = async (doc, bytes, usage) => {
  const totalPages = await countPdfPages(bytes)
  const queue = planChunks(totalPages, bytes.length)
  const done = []

  const worker = async () => {
    while (queue.length) {
      const { from, to } = queue.shift()
      let attempt = 0
      while (true) {
        try {
          const part = await extractPdfPages(bytes, from, to)
          const r = await transcribePdfRange({ apiKey: ANTHROPIC_API_KEY, model: MODEL, pdfBytes: part, from, to, totalPages, title: doc.title })
          usage.input += r.inputTokens; usage.output += r.outputTokens
          if (r.truncated && to > from) {
            const mid = Math.floor((from + to) / 2)
            queue.unshift({ from, to: mid }, { from: mid + 1, to })
          } else {
            done.push({ page_from: from, markdown: r.truncated ? `${r.markdown}\n\n[transcrição incompleta nesta página]` : r.markdown })
          }
          break
        } catch (err) {
          attempt++
          if (attempt >= 4) throw new Error(`páginas ${from}-${to}: ${err.message}`)
          await new Promise((r) => setTimeout(r, err.status === 429 ? 30000 : 3000 * attempt))
        }
      }
      process.stdout.write('.')
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  return { markdown: joinChunks(done), totalPages }
}

const main = async () => {
  await mkdir(OUT, { recursive: true })
  const select = 'id,slug,title,file_url,content_markdown,status'
  let docs = await rest(`documents?select=${select}&status=eq.published&order=created_at.asc&limit=10000`)
  docs = docs.filter((d) => d.file_url?.toLowerCase().split('?')[0].endsWith('.pdf'))

  const slugs = opt('slug', '')?.split(',').filter(Boolean)
  if (slugs?.length) docs = docs.filter((d) => slugs.includes(d.slug))
  else if (flag('missing')) docs = docs.filter((d) => !d.content_markdown?.trim())
  else if (!flag('all') && !flag('truncated')) {
    console.error('Escolha a seleção: --slug, --truncated, --missing ou --all')
    process.exit(1)
  }

  const usage = { input: 0, output: 0 }
  let processed = 0
  const report = []

  for (const doc of docs) {
    if (LIMIT && processed >= LIMIT) break
    const outFile = join(OUT, `${doc.slug}.md`)
    try {
      const bytes = await getPdf(doc)
      if (flag('truncated') && !slugs?.length && !(await looksTruncated(doc, bytes))) continue

      let markdown
      let totalPages
      try {
        markdown = await readFile(outFile, 'utf8') // retomada: já transcrito antes
        totalPages = await countPdfPages(bytes)
        process.stdout.write(`↺ ${doc.slug} (já em ${outFile})`)
      } catch {
        process.stdout.write(`→ ${doc.slug} `)
        ;({ markdown, totalPages } = await transcribeDoc(doc, bytes, usage))
        await writeFile(outFile, markdown)
      }
      processed++

      const before = doc.content_markdown?.length || 0
      report.push({ slug: doc.slug, pages: totalPages, before, after: markdown.length })
      console.log(` ${totalPages} págs, ${before} → ${markdown.length} caracteres`)

      if (APPLY) {
        await rest(`documents?id=eq.${doc.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            content_markdown: markdown,
            page_count: totalPages,
            transcription_status: markdown.includes('[transcrição incompleta nesta página]') ? 'partial' : 'complete',
            transcription_model: MODEL,
            transcribed_at: new Date().toISOString()
          })
        })
      }
    } catch (err) {
      console.log(`\n✗ ${doc.slug}: ${err.message}`)
      report.push({ slug: doc.slug, error: err.message })
    }
  }

  const [pin, pout] = PRICES[MODEL] || [NaN, NaN]
  const cost = (usage.input / 1e6) * pin + (usage.output / 1e6) * pout
  await writeFile(join(OUT, '_relatorio.json'), JSON.stringify({ model: MODEL, applied: APPLY, usage, estimatedCostUSD: cost, docs: report }, null, 2))
  console.log(`\n${processed} documento(s). Tokens: ${usage.input} entrada / ${usage.output} saída. Custo estimado: US$ ${cost.toFixed(2)}.`)
  console.log(APPLY ? 'Gravado no banco. Lembre de limpar o cache do site (qualquer publicação no painel faz isso).' : `Simulação: nada foi gravado. Arquivos em ${OUT}.`)
}

main().catch((err) => { console.error(err); process.exit(1) })

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DropZone from './DropZone'
import axios from 'axios'

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p className="label" style={{ marginBottom: 8 }}>{label}</p>
      {children}
    </div>
  )
}

const buttonStates = {
  idle: { background: '#fafafa', color: '#080808' },
  loading: { background: '#1c1c1c', color: '#737373' },
  done: { background: 'rgba(74,222,128,0.15)', color: '#4ade80' },
  error: { background: 'rgba(248,113,113,0.12)', color: '#f87171' },
}

export default function Sidebar({ onResults }) {
  const [jd, setJd] = useState('')
  const [must, setMust] = useState('')
  const [nice, setNice] = useState('')
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [progress, setProgress] = useState('')
  const [extracting, setExtracting] = useState(false)

  const autoExtract = async () => {
    if (!jd.trim()) return
    setExtracting(true)
    try {
      const { data } = await axios.post('/api/extract', { job_description: jd })
      setMust(data.keywords.join(', '))
    } catch { /* silent */ }
    setExtracting(false)
  }

  const analyse = async () => {
    const mustList = must.split(',').map(k => k.trim()).filter(Boolean)
    if (!files.length || !mustList.length) return

    setStatus('loading')
    setProgress(`Analysing 0 of ${files.length}…`)
    onResults(null)

    try {
      const form = new FormData()
      files.forEach(f => form.append('files', f))
      form.append('must_keywords', must)
      form.append('nice_keywords', nice)

      // fake per-file progress ticks
      let done = 0
      const ticker = setInterval(() => {
        done = Math.min(done + 1, files.length)
        setProgress(`Analysing ${done} of ${files.length}…`)
      }, 600)

      const { data } = await axios.post('/api/analyze', form)
      clearInterval(ticker)

      setStatus('done')
      setProgress('')
      onResults(data.results)

      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setProgress('Something went wrong')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  const canAnalyse = files.length > 0 && must.trim().length > 0 && status !== 'loading'

  return (
    <div style={{
      width: 320,
      flexShrink: 0,
      height: '100%',
      background: 'var(--s1)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 20px',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <p className="grotesk" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
          Resume Analyser
        </p>
        <p className="mono" style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>v2.0 · NLP-powered</p>
      </div>

      <Section label="Job Description">
        <textarea
          rows={5}
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Senior Python engineer with 3+ years in FastAPI, PostgreSQL, AWS…"
        />
        <motion.button
          onClick={autoExtract}
          disabled={!jd.trim() || extracting}
          whileHover={jd.trim() && !extracting ? { borderColor: 'var(--border-hi)', color: 'var(--text)' } : {}}
          whileTap={{ scale: 0.98 }}
          style={{
            marginTop: 7,
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 5,
            color: 'var(--muted)',
            fontSize: 11,
            padding: '6px 12px',
            cursor: jd.trim() && !extracting ? 'pointer' : 'not-allowed',
            fontFamily: 'JetBrains Mono, monospace',
            width: '100%',
            transition: 'color .15s, border-color .15s',
            opacity: jd.trim() ? 1 : 0.4,
          }}
        >
          {extracting ? 'Extracting…' : '⟳ Auto-extract keywords'}
        </motion.button>
      </Section>

      <Section label="Must-Have Keywords">
        <textarea
          rows={3}
          value={must}
          onChange={e => setMust(e.target.value)}
          placeholder="python, FastAPI, PostgreSQL, docker, AWS"
        />
      </Section>

      <Section label="Nice-to-Have Keywords">
        <textarea
          rows={2}
          value={nice}
          onChange={e => setNice(e.target.value)}
          placeholder="kubernetes, terraform, redis"
        />
      </Section>

      <Section label="Resumes">
        <DropZone files={files} onChange={setFiles} />
      </Section>

      {/* Analyse button */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <motion.button
          onClick={analyse}
          disabled={!canAnalyse}
          animate={buttonStates[status] || buttonStates.idle}
          whileHover={canAnalyse ? { scale: 1.02 } : {}}
          whileTap={canAnalyse ? { scale: 0.98 } : {}}
          transition={{ duration: 0.2 }}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 7,
            border: 'none',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            cursor: canAnalyse ? 'pointer' : 'not-allowed',
            opacity: canAnalyse ? 1 : 0.35,
            letterSpacing: '-0.01em',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            {status === 'loading' ? (
              <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {progress}
              </motion.span>
            ) : status === 'done' ? (
              <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                ✓ Done
              </motion.span>
            ) : status === 'error' ? (
              <motion.span key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {progress}
              </motion.span>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Analyse →
              </motion.span>
            )}
          </AnimatePresence>

          {/* loading scan line */}
          <AnimatePresence>
            {status === 'loading' && (
              <motion.div
                key="scan"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>
        </motion.button>

        {!canAnalyse && status === 'idle' && (
          <p className="mono" style={{ fontSize: 10, color: 'var(--dim)', textAlign: 'center', marginTop: 8 }}>
            {!files.length ? 'Upload resumes to continue' : 'Add must-have keywords to continue'}
          </p>
        )}
      </div>
    </div>
  )
}

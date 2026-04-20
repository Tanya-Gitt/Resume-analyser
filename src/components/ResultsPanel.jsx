import { motion, AnimatePresence } from 'framer-motion'
import CandidateRow from './CandidateRow'
import { useCountUp } from './useCountUp'

function MetricCard({ label, value, suffix = '', delay }) {
  const display = useCountUp(typeof value === 'number' ? Math.round(value) : 0, 900, true)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26, delay }}
      style={{
        padding: '16px 20px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'var(--s1)',
        flex: 1,
        minWidth: 0,
      }}
    >
      <p className="label" style={{ marginBottom: 8 }}>{label}</p>
      <p className="mono" style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>
        {typeof value === 'number' ? display : value}
        <span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 3 }}>{suffix}</span>
      </p>
    </motion.div>
  )
}

export default function ResultsPanel({ results }) {
  const qualified = results.filter(r => r.score >= 70).length
  const avg = results.reduce((s, r) => s + r.score, 0) / results.length

  const downloadCSV = () => {
    const headers = ['Rank','Name','Score','Must%','Nice%','Matched','Missing']
    const rows = results.map((r, i) => [
      i + 1,
      r.name,
      r.score + '%',
      r.must_score + '%',
      r.nice_score + '%',
      Object.keys(r.must_matches).join(' | '),
      r.must_missing.join(' | '),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'resume_analysis.csv'
    a.click()
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexShrink: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h2 className="grotesk" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Results
          </h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--dim)' }}>
            {results.length} candidate{results.length !== 1 ? 's' : ''}
          </span>
        </div>
        <motion.button
          whileHover={{ color: 'var(--text)', borderColor: 'var(--border-hi)' }}
          whileTap={{ scale: 0.97 }}
          onClick={downloadCSV}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 5,
            color: 'var(--muted)',
            fontSize: 11,
            padding: '5px 12px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            transition: 'color .15s, border-color .15s',
          }}
        >
          Export CSV ↓
        </motion.button>
      </motion.div>

      {/* Metrics */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexShrink: 0 }}>
        <MetricCard label="Total" value={results.length} delay={0} />
        <MetricCard label="Avg Score" value={avg} suffix="%" delay={0.06} />
        <MetricCard label="Top Score" value={results[0]?.score ?? 0} suffix="%" delay={0.12} />
        <MetricCard label="Qualified" value={qualified} delay={0.18} />
      </div>

      {/* Candidate list */}
      <div style={{ overflowY: 'auto', flex: 1, paddingRight: 2 }}>
        <AnimatePresence>
          {results.map((r, i) => (
            <CandidateRow
              key={r.name}
              candidate={r}
              rank={i + 1}
              delay={i * 0.06}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

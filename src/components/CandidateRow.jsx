import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScoreBar from './ScoreBar'
import Chips from './Chips'
import { useCountUp } from './useCountUp'

const scoreColor = (s) => s >= 70 ? 'var(--green)' : s >= 40 ? 'var(--yellow)' : 'var(--red)'
const verdict = (s) => s >= 70 ? 'STRONG MATCH' : s >= 40 ? 'PARTIAL MATCH' : 'WEAK MATCH'

export default function CandidateRow({ candidate, rank, delay }) {
  const [open, setOpen] = useState(false)
  const displayScore = useCountUp(candidate.score, 900, true)

  const {
    name, score, must_score, nice_score,
    must_matches, must_missing,
    nice_matches, nice_missing,
  } = candidate

  const hasNice = Object.keys(nice_matches || {}).length + (nice_missing || []).length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay }}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
        background: 'var(--s1)',
      }}
    >
      {/* Row header */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ background: 'var(--s2)' }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Rank */}
        <span className="mono" style={{ fontSize: 11, color: 'var(--dim)', width: 18, flexShrink: 0 }}>
          {String(rank).padStart(2, '0')}
        </span>

        {/* Score */}
        <motion.span
          className="mono"
          style={{ fontSize: 36, fontWeight: 600, color: scoreColor(score), width: 80, flexShrink: 0, lineHeight: 1 }}
        >
          {displayScore}<span style={{ fontSize: 16, opacity: 0.6 }}>%</span>
        </motion.span>

        {/* Name + bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="grotesk" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </p>
          <ScoreBar score={score} delay={delay + 0.2} />
        </div>

        {/* Verdict badge */}
        <span
          className="mono"
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.08em',
            color: scoreColor(score),
            flexShrink: 0,
            border: `1px solid ${scoreColor(score)}`,
            padding: '3px 8px',
            borderRadius: 3,
            opacity: 0.85,
          }}
        >
          {verdict(score)}
        </span>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ color: 'var(--dim)', fontSize: 14, flexShrink: 0 }}
        >
          ▾
        </motion.span>
      </motion.button>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>

              {/* Sub-scores */}
              <div style={{ display: 'flex', gap: 32, padding: '14px 0 12px' }}>
                <div>
                  <p className="label">Must-Have</p>
                  <p className="mono" style={{ fontSize: 24, fontWeight: 600, color: scoreColor(must_score), marginTop: 2 }}>
                    {must_score}<span style={{ fontSize: 13, opacity: 0.6 }}>%</span>
                  </p>
                </div>
                {hasNice && (
                  <div>
                    <p className="label">Nice-to-Have</p>
                    <p className="mono" style={{ fontSize: 24, fontWeight: 600, color: nice_score > 0 ? 'var(--blue)' : 'var(--dim)', marginTop: 2 }}>
                      {nice_score}<span style={{ fontSize: 13, opacity: 0.6 }}>%</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Must-have matched */}
              {Object.keys(must_matches).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p className="label" style={{ marginBottom: 4 }}>Matched</p>
                  <Chips items={Object.keys(must_matches)} variant="green" countMap={must_matches} />
                </div>
              )}

              {/* Must-have missing */}
              {must_missing.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p className="label" style={{ marginBottom: 4 }}>Missing</p>
                  <Chips items={must_missing} variant="red" />
                </div>
              )}

              {/* Nice matched */}
              {hasNice && Object.keys(nice_matches).length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <p className="label" style={{ marginBottom: 4 }}>Nice-to-Have Matched</p>
                  <Chips items={Object.keys(nice_matches)} variant="blue" countMap={nice_matches} />
                </div>
              )}

              {/* Nice missing */}
              {hasNice && (nice_missing || []).length > 0 && (
                <div>
                  <p className="label" style={{ marginBottom: 4 }}>Nice-to-Have Missing</p>
                  <Chips items={nice_missing} variant="yellow" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

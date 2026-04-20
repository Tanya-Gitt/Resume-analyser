import { motion } from 'framer-motion'

const words = ['Drop resumes.', 'Define requirements.', 'Find your hire.']

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
}
const word = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } },
}

const steps = [
  ['01', 'Paste a job description or add keywords manually in the left panel.'],
  ['02', 'Upload one or more resumes — PDF, DOCX, or plain text.'],
  ['03', 'Hit Analyse. Candidates are ranked and scored instantly.'],
]

export default function LandingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', height: '100%', padding: '0 8px' }}>

      {/* Status pill */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'block', boxShadow: '0 0 8px var(--green)' }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em' }}>READY</span>
      </motion.div>

      {/* Hero text */}
      <motion.div variants={container} initial="hidden" animate="show" style={{ marginBottom: 64 }}>
        {words.map((w, i) => (
          <motion.h1
            key={i}
            variants={word}
            className="grotesk"
            style={{
              fontSize: 'clamp(32px, 4vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: i === words.length - 1 ? 'var(--text)' : 'var(--muted)',
            }}
          >
            {w}
          </motion.h1>
        ))}
      </motion.div>

      {/* Steps */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.6 } } }}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        {steps.map(([num, text]) => (
          <motion.div
            key={num}
            variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } }}
            style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 480 }}
          >
            <span className="mono" style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2, flexShrink: 0 }}>{num}</span>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{text}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

import { motion } from 'framer-motion'

const scoreColor = (s) => s >= 70 ? 'var(--green)' : s >= 40 ? 'var(--yellow)' : 'var(--red)'

export default function ScoreBar({ score, delay = 0 }) {
  return (
    <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', width: '100%' }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: score / 100 }}
        transition={{ type: 'spring', stiffness: 90, damping: 20, delay }}
        style={{
          height: '100%',
          background: scoreColor(score),
          borderRadius: 99,
          transformOrigin: 'left',
          width: '100%',
        }}
      />
    </div>
  )
}

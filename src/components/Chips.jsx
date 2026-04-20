import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}
const chip = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 420, damping: 22 } },
}

export default function Chips({ items, variant, countMap }) {
  if (!items || items.length === 0) return null
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}
    >
      {items.map((kw) => (
        <motion.span key={kw} variants={chip} className={`chip chip-${variant}`} whileHover={{ scale: 1.06 }}>
          {kw}
          {countMap && countMap[kw] > 1 && (
            <span style={{ opacity: 0.5, fontSize: 10 }}>×{countMap[kw]}</span>
          )}
        </motion.span>
      ))}
    </motion.div>
  )
}

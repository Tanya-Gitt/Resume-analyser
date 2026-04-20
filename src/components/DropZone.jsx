import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FileCard = ({ file, onRemove }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: -8, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '7px 10px',
      background: 'var(--s2)',
      border: '1px solid var(--border)',
      borderRadius: '5px',
      marginBottom: '5px',
    }}
  >
    <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
      {file.name}
    </span>
    <button
      onClick={() => onRemove(file.name)}
      style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}
    >
      ×
    </button>
  </motion.div>
)

export default function DropZone({ files, onChange }) {
  const [dragging, setDragging] = useState(false)

  const addFiles = useCallback((incoming) => {
    const allowed = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain']
    const next = [...files]
    for (const f of incoming) {
      if (allowed.includes(f.type) && !next.find(x => x.name === f.name)) next.push(f)
    }
    onChange(next)
  }, [files, onChange])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    addFiles([...e.dataTransfer.files])
  }, [addFiles])

  const onInput = useCallback((e) => addFiles([...e.target.files]), [addFiles])
  const remove = useCallback((name) => onChange(files.filter(f => f.name !== name)), [files, onChange])

  return (
    <div>
      <motion.label
        htmlFor="file-input"
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        animate={{
          borderColor: dragging ? 'var(--green)' : 'var(--border)',
          background: dragging ? 'rgba(74,222,128,0.04)' : 'var(--s2)',
        }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'block',
          border: '1px dashed var(--border)',
          borderRadius: '6px',
          padding: '20px 16px',
          cursor: 'pointer',
          textAlign: 'center',
          marginBottom: '8px',
        }}
      >
        <motion.div
          animate={{ scale: dragging ? 1.12 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{ fontSize: 22, marginBottom: 6 }}
        >
          {dragging ? '⬇' : '↑'}
        </motion.div>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          Drag files here or <span style={{ color: 'var(--text)', textDecoration: 'underline' }}>browse</span>
        </p>
        <p className="mono" style={{ fontSize: 10, color: 'var(--dim)', marginTop: 4 }}>
          PDF · DOCX · TXT
        </p>
        <input id="file-input" type="file" accept=".pdf,.docx,.txt" multiple onChange={onInput} style={{ display: 'none' }} />
      </motion.label>

      <AnimatePresence mode="popLayout">
        {files.map(f => (
          <FileCard key={f.name} file={f} onRemove={remove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import ResultsPanel from './components/ResultsPanel'
import LandingState from './components/LandingState'
import './index.css'

const DEMO = [
  { name:"alice_chen.txt", score:100, must_score:100, nice_score:100, must_matches:{python:4,FastAPI:3,PostgreSQL:3,docker:4,"REST API":1,AWS:4}, must_missing:[], nice_matches:{kubernetes:2,terraform:2,redis:2,pytest:1,microservices:2}, nice_missing:[] },
  { name:"carol_diaz.txt", score:100, must_score:100, nice_score:100, must_matches:{python:5,FastAPI:4,PostgreSQL:4,docker:4,"REST API":1,AWS:5}, must_missing:[], nice_matches:{kubernetes:4,terraform:1,redis:2,pytest:1,microservices:1}, nice_missing:[] },
  { name:"bob_martin.txt", score:46.7, must_score:66.7, nice_score:0, must_matches:{python:4,docker:2,"REST API":1,AWS:1}, must_missing:["FastAPI","PostgreSQL"], nice_matches:{}, nice_missing:["kubernetes","terraform","redis","pytest","microservices"] },
  { name:"david_nguyen.txt", score:11.7, must_score:16.7, nice_score:0, must_matches:{python:1}, must_missing:["FastAPI","PostgreSQL","docker","REST API","AWS"], nice_matches:{}, nice_missing:["kubernetes","terraform","redis","pytest","microservices"] },
]

export default function App() {
  const [results, setResults] = useState(
    new URLSearchParams(window.location.search).has('demo') ? DEMO : null
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar onResults={setResults} />

      {/* Main panel */}
      <main
        className="dot-grid"
        style={{ flex: 1, overflowY: 'auto', padding: '40px 48px', display: 'flex', flexDirection: 'column' }}
      >
        <AnimatePresence mode="wait">
          {results ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <ResultsPanel results={results} />
            </motion.div>
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1 }}
            >
              <LandingState />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

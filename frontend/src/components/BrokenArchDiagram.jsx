import { useState, useEffect } from 'react'

export default function BrokenArchDiagram() {
  const [phase, setPhase] = useState('before')
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setPhase(p => p === 'before' ? 'after' : 'before')
        setFading(false)
      }, 600)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const isBefore = phase === 'before'

  const boxStyle = {
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))',
  }

  return (
    <div style={{ position: 'relative', background: '#080808', borderRadius: '12px', overflow: 'hidden' }}>
      <style>{`
        @keyframes flow {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -15; }
        }
        @keyframes flow-orange {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -11; }
        }
        @keyframes auth-ghost {
          0%,100% { opacity:.28; }
          50%     { opacity:.1; }
        }
        .bad-fl  { stroke-dasharray:2 13; animation: flow 1.5s linear infinite; }
        .bad-fb  { stroke-dasharray:2 9;  animation: flow-orange .9s linear infinite; }
        .good-fl { stroke-dasharray:2 13; animation: flow 1.5s linear infinite; }
      `}</style>

      {/* Label pill */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        background: isBefore ? '#1a0a00' : '#001a0a',
        border: `1px solid ${isBefore ? '#e8642a' : '#22c55e'}`,
        color: isBefore ? '#e8642a' : '#22c55e',
        fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em',
        padding: '4px 12px', borderRadius: '999px',
        transition: 'all 0.6s ease',
        zIndex: 10, whiteSpace: 'nowrap'
      }}>
        {isBefore ? 'AI-GENERATED' : 'WITH VERTOIZ'}
      </div>

      <svg
        width="100%"
        viewBox="0 0 340 440"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease' }}
      >
        <defs>
          <marker id="arr-bad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <marker id="arr-good" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
          <filter id="box-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.7"/>
          </filter>
        </defs>

        {isBefore ? (
          <>
            {/* Normal flow lines */}
            <line className="bad-fl" x1="170" y1="94"  x2="170" y2="119" stroke="#2e2e2e" strokeWidth="0.5" markerEnd="url(#arr-bad)"/>
            <line className="bad-fl" x1="170" y1="164" x2="170" y2="189" stroke="#2e2e2e" strokeWidth="0.5" markerEnd="url(#arr-bad)" style={{ animationDelay: '-.55s' }}/>
            <line className="bad-fl" x1="170" y1="234" x2="170" y2="259" stroke="#2e2e2e" strokeWidth="0.5" markerEnd="url(#arr-bad)" style={{ animationDelay: '-1.1s' }}/>
            <line className="bad-fl" x1="170" y1="304" x2="170" y2="329" stroke="#2e2e2e" strokeWidth="0.5" markerEnd="url(#arr-bad)" style={{ animationDelay: '-1.65s' }}/>

            {/* Broken: Frontend → Database bypass (right) */}
            <path className="bad-fb" d="M250,72 L292,72 L292,272 L250,272" fill="none" stroke="#e8642a" strokeWidth="1.5" markerEnd="url(#arr-bad)"/>
            {/* Broken: WebSocket loops back to Frontend (left) */}
            <path className="bad-fb" d="M100,272 L48,272 L48,72 L100,72" fill="none" stroke="#e8642a" strokeWidth="1.5" markerEnd="url(#arr-bad)" style={{ animationDelay: '-.35s' }}/>

            {/* Frontend */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="50" width="140" height="44" rx="4" fill="#161616" stroke="#2a2a2a" strokeWidth="0.5"/>
              <text x="170" y="72" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Frontend</text>
            </g>
            {/* API Gateway */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="120" width="140" height="44" rx="4" fill="#161616" stroke="#2a2a2a" strokeWidth="0.5"/>
              <text x="170" y="142" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">API Gateway</text>
            </g>
            {/* Auth ghost */}
            <g style={{ animation: 'auth-ghost 3.2s ease-in-out infinite' }} filter="url(#box-shadow)">
              <rect x="8" y="190" width="80" height="44" rx="4" fill="#161616" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="4 3"/>
              <text x="48" y="212" textAnchor="middle" dominantBaseline="central" fill="#444" fontFamily="sans-serif" fontSize="13" fontWeight="500">Auth</text>
            </g>
            {/* Database */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="190" width="140" height="44" rx="4" fill="#161616" stroke="#2a2a2a" strokeWidth="0.5"/>
              <text x="170" y="212" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Database</text>
            </g>
            {/* WebSocket */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="260" width="140" height="44" rx="4" fill="#161616" stroke="#2a2a2a" strokeWidth="0.5"/>
              <text x="170" y="282" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">WebSocket</text>
            </g>
            {/* Queue */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="330" width="140" height="44" rx="4" fill="#161616" stroke="#2a2a2a" strokeWidth="0.5"/>
              <text x="170" y="352" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Queue</text>
            </g>

            {/* Legend */}
            <line x1="55" y1="402" x2="80" y2="402" stroke="#2e2e2e" strokeWidth="0.5"/>
            <text x="86" y="406" fill="#3a3a3a" fontFamily="sans-serif" fontSize="11">expected path</text>
            <line x1="55" y1="420" x2="80" y2="420" stroke="#e8642a" strokeWidth="1.5"/>
            <text x="86" y="424" fill="#3a3a3a" fontFamily="sans-serif" fontSize="11">architectural gap</text>
          </>
        ) : (
          <>
            {/* Clean vertical flow */}
            <line className="good-fl" x1="170" y1="94"  x2="170" y2="119" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-good)"/>
            <line className="good-fl" x1="170" y1="164" x2="170" y2="189" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-.55s' }}/>
            <line className="good-fl" x1="170" y1="234" x2="170" y2="259" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-1.1s' }}/>
            <line className="good-fl" x1="170" y1="304" x2="170" y2="329" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-1.65s' }}/>

            {/* Auth properly wired */}
            <line className="good-fl" x1="100" y1="142" x2="65" y2="142" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-good)"/>
            <line className="good-fl" x1="65"  y1="142" x2="65" y2="212" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-.3s' }}/>
            <line className="good-fl" x1="88"  y1="212" x2="100" y2="212" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-.6s' }}/>

            {/* Frontend */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="50" width="140" height="44" rx="4" fill="#161616" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="72" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Frontend</text>
            </g>
            {/* API Gateway */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="120" width="140" height="44" rx="4" fill="#161616" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="142" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">API Gateway</text>
            </g>
            {/* Auth wired in */}
            <g filter="url(#box-shadow)">
              <rect x="8" y="190" width="80" height="44" rx="4" fill="#161616" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="48" y="212" textAnchor="middle" dominantBaseline="central" fill="#22c55e" fontFamily="sans-serif" fontSize="13" fontWeight="500">Auth</text>
            </g>
            {/* Database */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="190" width="140" height="44" rx="4" fill="#161616" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="212" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Database</text>
            </g>
            {/* WebSocket */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="260" width="140" height="44" rx="4" fill="#161616" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="282" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">WebSocket</text>
            </g>
            {/* Queue */}
            <g filter="url(#box-shadow)">
              <rect x="100" y="330" width="140" height="44" rx="4" fill="#161616" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="352" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Queue</text>
            </g>

            {/* Legend */}
            <line x1="55" y1="402" x2="80" y2="402" stroke="#22c55e" strokeWidth="1.5"/>
            <text x="86" y="406" fill="#3a3a3a" fontFamily="sans-serif" fontSize="11">clean architecture</text>
            <line x1="55" y1="420" x2="80" y2="420" stroke="#1a3a1a" strokeWidth="1"/>
            <text x="86" y="424" fill="#3a3a3a" fontFamily="sans-serif" fontSize="11">auth wired correctly</text>
          </>
        )}
      </svg>
    </div>
  )
}

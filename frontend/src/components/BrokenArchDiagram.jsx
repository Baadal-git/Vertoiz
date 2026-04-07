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
        @keyframes flow-green {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -15; }
        }
        @keyframes auth-ghost {
          0%,100% { opacity:.28; }
          50%     { opacity:.1; }
        }
        .bad-fl { stroke-dasharray:2 13; animation: flow 1.5s linear infinite; }
        .bad-fb { stroke-dasharray:2 9;  animation: flow-orange .9s linear infinite; }
        .good-fl { stroke-dasharray:2 13; animation: flow-green 1.5s linear infinite; }
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
 
      {/* SVG */}
      <svg
        width="100%"
        viewBox="0 0 340 560"
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
        </defs>
 
        {isBefore ? (
          <>
            {/* Normal flow lines */}
            <line className="bad-fl" x1="170" y1="104" x2="170" y2="139" stroke="#2e2e2e" strokeWidth="0.5" markerEnd="url(#arr-bad)"/>
            <line className="bad-fl" x1="170" y1="184" x2="170" y2="219" stroke="#2e2e2e" strokeWidth="0.5" markerEnd="url(#arr-bad)" style={{ animationDelay: '-.55s' }}/>
            <line className="bad-fl" x1="170" y1="264" x2="170" y2="299" stroke="#2e2e2e" strokeWidth="0.5" markerEnd="url(#arr-bad)" style={{ animationDelay: '-1.1s' }}/>
            <line className="bad-fl" x1="170" y1="344" x2="170" y2="379" stroke="#2e2e2e" strokeWidth="0.5" markerEnd="url(#arr-bad)" style={{ animationDelay: '-1.65s' }}/>
 
            {/* Broken: Frontend → Database bypass (right) */}
            <path className="bad-fb" d="M250,82 L295,82 L295,322 L250,322" fill="none" stroke="#e8642a" strokeWidth="1.5" markerEnd="url(#arr-bad)"/>
            {/* Broken: WebSocket loops back to Frontend (left) */}
            <path className="bad-fb" d="M100,322 L45,322 L45,82 L100,82" fill="none" stroke="#e8642a" strokeWidth="1.5" markerEnd="url(#arr-bad)" style={{ animationDelay: '-.35s' }}/>
 
            {/* Boxes */}
            <g>
              <rect x="100" y="60" width="140" height="44" rx="4" fill="#111" stroke="#242424" strokeWidth="0.5"/>
              <text x="170" y="82" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Frontend</text>
            </g>
            <g>
              <rect x="100" y="140" width="140" height="44" rx="4" fill="#111" stroke="#242424" strokeWidth="0.5"/>
              <text x="170" y="162" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">API Gateway</text>
            </g>
            {/* Auth ghost */}
            <g style={{ opacity: 0.28, animation: 'auth-ghost 3.2s ease-in-out infinite' }}>
              <rect x="8" y="220" width="80" height="44" rx="4" fill="#111" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="4 3"/>
              <text x="48" y="242" textAnchor="middle" dominantBaseline="central" fill="#444" fontFamily="sans-serif" fontSize="13" fontWeight="500">Auth</text>
            </g>
            <g>
              <rect x="100" y="220" width="140" height="44" rx="4" fill="#111" stroke="#242424" strokeWidth="0.5"/>
              <text x="170" y="242" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Database</text>
            </g>
            <g>
              <rect x="100" y="300" width="140" height="44" rx="4" fill="#111" stroke="#242424" strokeWidth="0.5"/>
              <text x="170" y="322" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">WebSocket</text>
            </g>
            <g>
              <rect x="100" y="380" width="140" height="44" rx="4" fill="#111" stroke="#242424" strokeWidth="0.5"/>
              <text x="170" y="402" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Queue</text>
            </g>
 
            {/* Legend */}
            <line x1="55" y1="510" x2="80" y2="510" stroke="#2e2e2e" strokeWidth="0.5"/>
            <text x="86" y="514" fill="#3a3a3a" fontFamily="sans-serif" fontSize="11">expected path</text>
            <line x1="55" y1="530" x2="80" y2="530" stroke="#e8642a" strokeWidth="1.5"/>
            <text x="86" y="534" fill="#3a3a3a" fontFamily="sans-serif" fontSize="11">architectural gap</text>
          </>
        ) : (
          <>
            {/* Clean flow lines — all green */}
            <line className="good-fl" x1="170" y1="104" x2="170" y2="139" stroke="#22c55e" strokeWidth="0.5" markerEnd="url(#arr-good)"/>
            <line className="good-fl" x1="170" y1="184" x2="170" y2="219" stroke="#22c55e" strokeWidth="0.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-.55s' }}/>
            <line className="good-fl" x1="170" y1="264" x2="170" y2="299" stroke="#22c55e" strokeWidth="0.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-1.1s' }}/>
            <line className="good-fl" x1="170" y1="344" x2="170" y2="379" stroke="#22c55e" strokeWidth="0.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-1.65s' }}/>
 
            {/* Auth properly wired in */}
            <line className="good-fl" x1="100" y1="162" x2="65" y2="162" stroke="#22c55e" strokeWidth="0.5" markerEnd="url(#arr-good)"/>
            <line className="good-fl" x1="65" y1="162" x2="65" y2="242" stroke="#22c55e" strokeWidth="0.5" markerEnd="url(#arr-good)" style={{ animationDelay: '-.3s' }}/>
 
            {/* Boxes */}
            <g>
              <rect x="100" y="60" width="140" height="44" rx="4" fill="#111" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="82" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Frontend</text>
            </g>
            <g>
              <rect x="100" y="140" width="140" height="44" rx="4" fill="#111" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="162" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">API Gateway</text>
            </g>
            {/* Auth — now properly connected */}
            <g>
              <rect x="8" y="220" width="80" height="44" rx="4" fill="#111" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="48" y="242" textAnchor="middle" dominantBaseline="central" fill="#22c55e" fontFamily="sans-serif" fontSize="13" fontWeight="500">Auth</text>
            </g>
            <g>
              <rect x="100" y="220" width="140" height="44" rx="4" fill="#111" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="242" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Database</text>
            </g>
            <g>
              <rect x="100" y="300" width="140" height="44" rx="4" fill="#111" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="322" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">WebSocket</text>
            </g>
            <g>
              <rect x="100" y="380" width="140" height="44" rx="4" fill="#111" stroke="#1a3a1a" strokeWidth="0.5"/>
              <text x="170" y="402" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="sans-serif" fontSize="13" fontWeight="500">Queue</text>
            </g>
 
            {/* Legend */}
            <line x1="55" y1="510" x2="80" y2="510" stroke="#22c55e" strokeWidth="0.5"/>
            <text x="86" y="514" fill="#3a3a3a" fontFamily="sans-serif" fontSize="11">clean architecture</text>
            <line x1="55" y1="530" x2="80" y2="530" stroke="#1a3a1a" strokeWidth="1"/>
            <text x="86" y="534" fill="#3a3a3a" fontFamily="sans-serif" fontSize="11">auth wired correctly</text>
          </>
        )}
      </svg>
    </div>
  )
}

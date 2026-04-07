export default function BrokenArchDiagram() {
  return (
    <>
      <style>{'
@keyframes fadein {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes flow {
  to { stroke-dashoffset:-20; }
}
@keyframes flow-orange {
  to { stroke-dashoffset:-16; }
}
@keyframes orange-pulse {
  0%,100% { opacity:.55; }
  50%      { opacity:1; }
}
@keyframes auth-init {
  0%   { opacity:0; transform:translateY(5px); }
  15%  { opacity:.35; transform:translateY(0); }
  55%  { opacity:.12; }
  85%  { opacity:.38; }
  100% { opacity:.28; }
}
@keyframes auth-ghost {
  0%,100% { opacity:.28; }
  50%      { opacity:.1; }
}

.box { opacity:0; animation: fadein .45s ease both; }
#b1 { animation-delay:.05s }
#b2 { animation-delay:.15s }
#b4 { animation-delay:.25s }
#b5 { animation-delay:.35s }
#b6 { animation-delay:.45s }
#b3 { opacity:0; animation: auth-init 2.2s ease .3s 1 forwards, auth-ghost 3.2s ease-in-out 2.5s infinite; }

.fl {
  stroke-dasharray: 2 13;
  animation: flow 1.5s linear infinite;
}
.fb {
  stroke-dasharray: 2 9;
  animation: flow-orange .9s linear infinite, orange-pulse 2.8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .box { opacity:1 !important; animation:none !important; }
  .fl, .fb { animation:none !important; stroke-dasharray:none !important; opacity:.6; }
  #b3 { opacity:.3 !important; animation:none !important; }
        }
      `}</style>
      {<svg width="100%" viewBox="0 0 680 430" xmlns="http://www.w3.org/2000/svg" style="display:block;background:#080808;border-radius:12px">
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <!-- Normal flow lines -->
  <line class="fl" x1="340" y1="94" x2="340" y2="139" stroke="#2e2e2e" stroke-width="0.5" marker-end="url(#arr)"/>
  <line class="fl" x1="340" y1="184" x2="340" y2="229" stroke="#2e2e2e" stroke-width="0.5" marker-end="url(#arr)" style="animation-delay:-.55s"/>
  <line class="fl" x1="340" y1="274" x2="340" y2="319" stroke="#2e2e2e" stroke-width="0.5" marker-end="url(#arr)" style="animation-delay:-1.1s"/>

  <!-- Broken paths (orange) -->
  <path class="fb" d="M410,72 L458,72 L458,252 L410,252" fill="none" stroke="#e8642a" stroke-width="0.5" marker-end="url(#arr)"/>
  <path class="fb" d="M560,230 L560,14 L340,14 L340,50"  fill="none" stroke="#e8642a" stroke-width="0.5" marker-end="url(#arr)" style="animation-delay:-.35s"/>

  <!-- Boxes -->
  <g id="b1" class="box">
    <rect x="270" y="50" width="140" height="44" rx="4" fill="#111" stroke="#242424" stroke-width="0.5"/>
    <text x="340" y="72" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="var(--font-sans,sans-serif)" font-size="14" font-weight="500">Frontend</text>
  </g>
  <g id="b2" class="box">
    <rect x="270" y="140" width="140" height="44" rx="4" fill="#111" stroke="#242424" stroke-width="0.5"/>
    <text x="340" y="162" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="var(--font-sans,sans-serif)" font-size="14" font-weight="500">API Gateway</text>
  </g>
  <g id="b3">
    <rect x="50" y="230" width="130" height="44" rx="4" fill="#111" stroke="#2a2a2a" stroke-width="0.5" stroke-dasharray="4 3"/>
    <text x="115" y="252" text-anchor="middle" dominant-baseline="central" fill="#505050" font-family="var(--font-sans,sans-serif)" font-size="14" font-weight="500">Auth</text>
  </g>
  <g id="b4" class="box">
    <rect x="270" y="230" width="140" height="44" rx="4" fill="#111" stroke="#242424" stroke-width="0.5"/>
    <text x="340" y="252" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="var(--font-sans,sans-serif)" font-size="14" font-weight="500">Database</text>
  </g>
  <g id="b5" class="box">
    <rect x="480" y="230" width="160" height="44" rx="4" fill="#111" stroke="#242424" stroke-width="0.5"/>
    <text x="560" y="252" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="var(--font-sans,sans-serif)" font-size="14" font-weight="500">WebSocket server</text>
  </g>
  <g id="b6" class="box">
    <rect x="270" y="320" width="140" height="44" rx="4" fill="#111" stroke="#242424" stroke-width="0.5"/>
    <text x="340" y="342" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="var(--font-sans,sans-serif)" font-size="14" font-weight="500">Queue</text>
  </g>

  <!-- Legend -->
  <line x1="434" y1="400" x2="460" y2="400" stroke="#2e2e2e" stroke-width="0.5"/>
  <text x="466" y="404" fill="#3a3a3a" font-family="var(--font-sans,sans-serif)" font-size="12">expected path</text>
  <line x1="434" y1="418" x2="460" y2="418" stroke="#e8642a" stroke-width="0.5"/>
  <text x="466" y="422" fill="#3a3a3a" font-family="var(--font-sans,sans-serif)" font-size="12">architectural gap</text>
</svg>}
    </>
  )
}

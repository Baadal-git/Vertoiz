
<style>
@keyframes dash-bad  { to { stroke-dashoffset: -18; } }
@keyframes dash-good { to { stroke-dashoffset: -15; } }
.fb { stroke-dasharray: 3 9;  animation: dash-bad  0.9s linear infinite; }
.fg { stroke-dasharray: 3 12; animation: dash-good 1.8s linear infinite; }
#wrap { transition: opacity .5s ease; }
#pill { transition: all .5s ease; }
</style>

<div style="background:#0b1f3a; border-radius:12px; overflow:hidden; padding:24px 16px 28px; font-family:'Courier New',monospace; display:flex; flex-direction:column; align-items:center; position:relative;">

  <!-- grid overlay -->
  <svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:.18;" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#a8c8f0" stroke-width="0.4"/>
      </pattern>
      <pattern id="grid-big" width="120" height="120" patternUnits="userSpaceOnUse">
        <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#a8c8f0" stroke-width="0.9"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <rect width="100%" height="100%" fill="url(#grid-big)"/>
  </svg>

  <!-- title bar -->
  <div style="width:100%;max-width:420px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(168,200,240,0.25);padding-bottom:8px;margin-bottom:12px;position:relative;z-index:1;">
    <span style="font-size:9px;letter-spacing:.15em;color:rgba(168,200,240,0.5);">DWG NO. VTZ-001</span>
    <div id="pill" style="font-size:9px;font-weight:700;letter-spacing:.14em;padding:3px 14px;border-radius:2px;border:1px solid rgba(168,200,240,0.4);color:rgba(168,200,240,0.55);background:rgba(168,200,240,0.06);">WITHOUT VERTOIZ</div>
    <span style="font-size:9px;letter-spacing:.15em;color:rgba(168,200,240,0.5);">REV A</span>
  </div>

  <svg id="wrap" width="100%" viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" style="position:relative;z-index:1;">
    <defs>
      <marker id="mb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(168,200,240,0.3)" stroke-width="1.5" stroke-linecap="round"/>
      </marker>
      <marker id="mg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(168,200,240,0.9)" stroke-width="1.5" stroke-linecap="round"/>
      </marker>
    </defs>

    <!-- ── BEFORE ── -->
    <g id="bl">
      <!-- centre-line markers -->
      <line x1="200" y1="8" x2="200" y2="20" stroke="rgba(168,200,240,0.2)" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="200" y1="540" x2="200" y2="552" stroke="rgba(168,200,240,0.2)" stroke-width="1" stroke-dasharray="2 2"/>

      <!-- bypass arc -->
      <path class="fb" d="M306 80 Q362 80 362 232 Q362 380 306 380" fill="none" stroke="rgba(168,200,240,0.28)" stroke-width="1.2" stroke-dasharray="5 5" marker-end="url(#mb)"/>
      <text x="372" y="232" text-anchor="middle" fill="rgba(168,200,240,0.28)" font-family="'Courier New',monospace" font-size="7.5" letter-spacing=".1em" transform="rotate(90,372,232)">BYPASSES LOGIC LAYER</text>

      <!-- ghost connectors -->
      <line class="fb" x1="200" y1="90" x2="200" y2="168" stroke="rgba(168,200,240,0.15)" stroke-width="1" stroke-dasharray="3 5" marker-end="url(#mb)" style="animation-delay:-.3s"/>
      <line class="fb" x1="200" y1="216" x2="200" y2="288" stroke="rgba(168,200,240,0.15)" stroke-width="1" stroke-dasharray="3 5" marker-end="url(#mb)" style="animation-delay:-.6s"/>
      <line class="fb" x1="200" y1="336" x2="200" y2="408" stroke="rgba(168,200,240,0.15)" stroke-width="1" stroke-dasharray="3 5" marker-end="url(#mb)" style="animation-delay:-.9s"/>

      <!-- corner marks helper -->
      <!-- App box -->
      <rect x="96" y="32" width="208" height="58" rx="0" fill="rgba(168,200,240,0.04)" stroke="rgba(168,200,240,0.3)" stroke-width="1"/>
      <!-- corner ticks -->
      <path d="M96 42 L96 32 L106 32" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M294 32 L304 32 L304 42" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M96 80 L96 90 L106 90" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M294 90 L304 90 L304 80" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <text x="200" y="57" text-anchor="middle" fill="rgba(168,200,240,0.75)" font-family="'Courier New',monospace" font-size="12" font-weight="700" letter-spacing=".08em">YOUR APP</text>
      <text x="200" y="74" text-anchor="middle" fill="rgba(168,200,240,0.35)" font-family="'Courier New',monospace" font-size="9">[ frontend · vibe-coded ]</text>

      <!-- Logic ghost box -->
      <rect x="96" y="168" width="208" height="48" rx="0" fill="rgba(168,200,240,0.02)" stroke="rgba(168,200,240,0.1)" stroke-width="1" stroke-dasharray="6 4"/>
      <text x="200" y="190" text-anchor="middle" fill="rgba(168,200,240,0.18)" font-family="'Courier New',monospace" font-size="12" font-weight="700" letter-spacing=".06em">LOGIC LAYER ?</text>
      <text x="200" y="208" text-anchor="middle" fill="rgba(168,200,240,0.1)" font-family="'Courier New',monospace" font-size="9">[ not specified ]</text>

      <!-- Supabase RT box -->
      <rect x="96" y="288" width="208" height="48" rx="0" fill="rgba(168,200,240,0.04)" stroke="rgba(168,200,240,0.3)" stroke-width="1"/>
      <path d="M96 298 L96 288 L106 288" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M294 288 L304 288 L304 298" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M96 326 L96 336 L106 336" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M294 336 L304 336 L304 326" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <text x="200" y="309" text-anchor="middle" fill="rgba(168,200,240,0.75)" font-family="'Courier New',monospace" font-size="12" font-weight="700" letter-spacing=".06em">SUPABASE RT</text>
      <text x="200" y="326" text-anchor="middle" fill="rgba(168,200,240,0.35)" font-family="'Courier New',monospace" font-size="9">[ realtime · db ]</text>

      <!-- Postgres box -->
      <rect x="96" y="408" width="208" height="48" rx="0" fill="rgba(168,200,240,0.04)" stroke="rgba(168,200,240,0.3)" stroke-width="1"/>
      <path d="M96 418 L96 408 L106 408" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M294 408 L304 408 L304 418" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M96 446 L96 456 L106 456" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <path d="M294 456 L304 456 L304 446" fill="none" stroke="rgba(168,200,240,0.6)" stroke-width="1"/>
      <text x="200" y="429" text-anchor="middle" fill="rgba(168,200,240,0.75)" font-family="'Courier New',monospace" font-size="12" font-weight="700" letter-spacing=".06em">POSTGRES</text>
      <text x="200" y="446" text-anchor="middle" fill="rgba(168,200,240,0.35)" font-family="'Courier New',monospace" font-size="9">[ raw DB ]</text>

      <!-- annotation line + callouts -->
      <line x1="50" y1="480" x2="350" y2="480" stroke="rgba(168,200,240,0.12)" stroke-width="0.5"/>
      <text x="200" y="496" text-anchor="middle" fill="rgba(168,200,240,0.28)" font-family="'Courier New',monospace" font-size="9.5">✕ no auth  ·  ✕ no state  ·  ✕ no recovery</text>
      <text x="200" y="513" text-anchor="middle" fill="rgba(168,200,240,0.28)" font-family="'Courier New',monospace" font-size="9.5">✕ no WS mgmt  ·  ✕ direct DB calls</text>
    </g>

    <!-- ── AFTER ── -->
    <g id="al" display="none">
      <!-- clean connectors -->
      <line class="fg" x1="200" y1="90" x2="200" y2="160" stroke="rgba(168,200,240,0.7)" stroke-width="1.5" marker-end="url(#mg)"/>
      <line class="fg" x1="200" y1="240" x2="200" y2="288" stroke="rgba(168,200,240,0.7)" stroke-width="1.5" marker-end="url(#mg)" style="animation-delay:-.5s"/>
      <line class="fg" x1="200" y1="336" x2="200" y2="408" stroke="rgba(168,200,240,0.7)" stroke-width="1.5" marker-end="url(#mg)" style="animation-delay:-1s"/>

      <!-- App -->
      <rect x="96" y="32" width="208" height="58" rx="0" fill="rgba(168,200,240,0.06)" stroke="rgba(168,200,240,0.45)" stroke-width="1"/>
      <path d="M96 42 L96 32 L106 32" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M294 32 L304 32 L304 42" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M96 80 L96 90 L106 90" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M294 90 L304 90 L304 80" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <text x="200" y="57" text-anchor="middle" fill="rgba(168,200,240,0.85)" font-family="'Courier New',monospace" font-size="12" font-weight="700" letter-spacing=".08em">YOUR APP</text>
      <text x="200" y="74" text-anchor="middle" fill="rgba(168,200,240,0.4)" font-family="'Courier New',monospace" font-size="9">[ frontend · vibe-coded ]</text>

      <!-- Vertoiz — bright, full weight -->
      <rect x="86" y="160" width="228" height="80" rx="0" fill="rgba(168,200,240,0.1)" stroke="rgba(168,200,240,0.95)" stroke-width="1.5"/>
      <path d="M86 172 L86 160 L98 160" fill="none" stroke="#a8c8f0" stroke-width="1.5"/>
      <path d="M302 160 L314 160 L314 172" fill="none" stroke="#a8c8f0" stroke-width="1.5"/>
      <path d="M86 228 L86 240 L98 240" fill="none" stroke="#a8c8f0" stroke-width="1.5"/>
      <path d="M302 240 L314 240 L314 228" fill="none" stroke="#a8c8f0" stroke-width="1.5"/>
      <text x="200" y="188" text-anchor="middle" fill="#a8c8f0" font-family="'Courier New',monospace" font-size="14" font-weight="700" letter-spacing=".14em">VERTOIZ</text>
      <text x="200" y="207" text-anchor="middle" fill="rgba(168,200,240,0.65)" font-family="'Courier New',monospace" font-size="9.5" letter-spacing=".05em">[ WS SERVER · LOGIC LAYER ]</text>
      <text x="200" y="224" text-anchor="middle" fill="rgba(168,200,240,0.4)" font-family="'Courier New',monospace" font-size="8.5">auth · state · routing · recovery</text>

      <!-- Supabase RT -->
      <rect x="96" y="288" width="208" height="48" rx="0" fill="rgba(168,200,240,0.06)" stroke="rgba(168,200,240,0.45)" stroke-width="1"/>
      <path d="M96 298 L96 288 L106 288" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M294 288 L304 288 L304 298" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M96 326 L96 336 L106 336" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M294 336 L304 336 L304 326" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <text x="200" y="309" text-anchor="middle" fill="rgba(168,200,240,0.85)" font-family="'Courier New',monospace" font-size="12" font-weight="700" letter-spacing=".06em">SUPABASE RT</text>
      <text x="200" y="326" text-anchor="middle" fill="rgba(168,200,240,0.4)" font-family="'Courier New',monospace" font-size="9">[ realtime · db ]</text>

      <!-- Postgres -->
      <rect x="96" y="408" width="208" height="48" rx="0" fill="rgba(168,200,240,0.06)" stroke="rgba(168,200,240,0.45)" stroke-width="1"/>
      <path d="M96 418 L96 408 L106 408" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M294 408 L304 408 L304 418" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M96 446 L96 456 L106 456" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <path d="M294 456 L304 456 L304 446" fill="none" stroke="rgba(168,200,240,0.8)" stroke-width="1"/>
      <text x="200" y="429" text-anchor="middle" fill="rgba(168,200,240,0.85)" font-family="'Courier New',monospace" font-size="12" font-weight="700" letter-spacing=".06em">POSTGRES</text>
      <text x="200" y="446" text-anchor="middle" fill="rgba(168,200,240,0.4)" font-family="'Courier New',monospace" font-size="9">[ raw DB ]</text>

      <!-- callouts -->
      <line x1="50" y1="476" x2="350" y2="476" stroke="rgba(168,200,240,0.15)" stroke-width="0.5"/>
      <text x="200" y="492" text-anchor="middle" fill="rgba(168,200,240,0.45)" font-family="'Courier New',monospace" font-size="9.5">✓ auth enforced  ·  ✓ state managed</text>
      <text x="200" y="509" text-anchor="middle" fill="rgba(168,200,240,0.45)" font-family="'Courier New',monospace" font-size="9.5">✓ WS managed  ·  ✓ recovery handled</text>
    </g>
  </svg>

  <!-- footer stamp -->
  <div style="width:100%;max-width:420px;display:flex;justify-content:space-between;border-top:1px solid rgba(168,200,240,0.15);padding-top:8px;margin-top:4px;position:relative;z-index:1;">
    <span style="font-size:8px;letter-spacing:.12em;color:rgba(168,200,240,0.25);">VERTOIZ.COM</span>
    <span style="font-size:8px;letter-spacing:.12em;color:rgba(168,200,240,0.25);">BACKEND ARCHITECTURE ENFORCEMENT</span>
    <span style="font-size:8px;letter-spacing:.12em;color:rgba(168,200,240,0.25);">SCALE: N/A</span>
  </div>
</div>

<script>
let phase = 'before';
setInterval(() => {
  const wrap = document.getElementById('wrap');
  const pill = document.getElementById('pill');
  wrap.style.opacity = '0';
  setTimeout(() => {
    phase = phase === 'before' ? 'after' : 'before';
    const b = phase === 'before';
    document.getElementById('bl').setAttribute('display', b ? '' : 'none');
    document.getElementById('al').setAttribute('display', b ? 'none' : '');
    pill.style.color   = b ? 'rgba(168,200,240,0.45)' : 'rgba(168,200,240,0.9)';
    pill.style.borderColor = b ? 'rgba(168,200,240,0.3)' : 'rgba(168,200,240,0.8)';
    pill.style.background  = b ? 'rgba(168,200,240,0.04)' : 'rgba(168,200,240,0.1)';
    pill.textContent   = b ? 'WITHOUT VERTOIZ' : 'WITH VERTOIZ';
    wrap.style.opacity = '1';
  }, 450);
}, 4200);
</script>

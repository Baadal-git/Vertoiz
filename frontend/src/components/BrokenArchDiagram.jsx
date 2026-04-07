import { useState, useEffect } from "react";

const styles = `
  @keyframes dash-bad  { to { stroke-dashoffset: -18; } }
  @keyframes dash-good { to { stroke-dashoffset: -15; } }
  .bp-fb { stroke-dasharray: 3 9;  animation: dash-bad  0.9s linear infinite; }
  .bp-fg { stroke-dasharray: 3 12; animation: dash-good 1.8s linear infinite; }
`;

const C = (a) => `rgba(168,200,240,${a})`;

function CornerMarks({ x, y, w, h, opacity = 1 }) {
  const s = C(opacity);
  const t = 10;
  return (
    <>
      <path d={`M${x} ${y+t} L${x} ${y} L${x+t} ${y}`}             fill="none" stroke={s} strokeWidth="1.2" />
      <path d={`M${x+w-t} ${y} L${x+w} ${y} L${x+w} ${y+t}`}       fill="none" stroke={s} strokeWidth="1.2" />
      <path d={`M${x} ${y+h-t} L${x} ${y+h} L${x+t} ${y+h}`}       fill="none" stroke={s} strokeWidth="1.2" />
      <path d={`M${x+w-t} ${y+h} L${x+w} ${y+h} L${x+w} ${y+h-t}`} fill="none" stroke={s} strokeWidth="1.2" />
    </>
  );
}

function Box({ x, y, w, h, label, sub, stroke = 0.5, fill = 0.07, labelA = 1, subA = 0.55, cornerA = 0.9, dashed = false }) {
  return (
    <>
      <rect
        x={x} y={y} width={w} height={h}
        fill={C(fill)} stroke={C(stroke)} strokeWidth={1.2}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
      <CornerMarks x={x} y={y} w={w} h={h} opacity={cornerA} />
      <text x={x+w/2} y={y+h/2 - 7} textAnchor="middle"
        fill={C(labelA)} fontFamily="'Courier New',monospace" fontSize={13} fontWeight={700} letterSpacing="0.08em">
        {label}
      </text>
      {sub && (
        <text x={x+w/2} y={y+h/2 + 10} textAnchor="middle"
          fill={C(subA)} fontFamily="'Courier New',monospace" fontSize={9.5}>
          {sub}
        </text>
      )}
    </>
  );
}

function BeforeLayer() {
  return (
    <g>
      {/* bypass arc */}
      <path className="bp-fb"
        d="M306 80 Q362 80 362 232 Q362 380 306 380"
        fill="none" stroke={C(0.35)} strokeWidth={1.5} strokeDasharray="5 5"
        markerEnd="url(#mb)"
      />
      <text x={374} y={232} textAnchor="middle"
        fill={C(0.5)} fontFamily="'Courier New',monospace" fontSize={8} letterSpacing="0.1em"
        transform="rotate(90,374,232)">
        BYPASSES LOGIC LAYER
      </text>

      {/* ghost connectors */}
      {[{y1:90,y2:168,d:"-0.3s"},{y1:216,y2:288,d:"-0.6s"},{y1:336,y2:408,d:"-0.9s"}].map(({y1,y2,d},i)=>(
        <line key={i} className="bp-fb"
          x1={200} y1={y1} x2={200} y2={y2}
          stroke={C(0.2)} strokeWidth={1} strokeDasharray="3 5"
          markerEnd="url(#mb)" style={{animationDelay:d}}
        />
      ))}

      <Box x={96} y={32}  w={208} h={58} label="YOUR APP"      sub="[ frontend · vibe-coded ]" stroke={0.5} />
      <Box x={96} y={168} w={208} h={48} label="LOGIC LAYER ?" sub="[ not specified ]"
        stroke={0.2} fill={0.03} labelA={0.35} subA={0.22} cornerA={0.22} dashed />
      <Box x={96} y={288} w={208} h={48} label="SUPABASE RT"   sub="[ realtime · db ]" stroke={0.5} />
      <Box x={96} y={408} w={208} h={48} label="POSTGRES"      sub="[ raw DB ]" stroke={0.5} />

      <line x1={50} y1={478} x2={350} y2={478} stroke={C(0.2)} strokeWidth={0.5}/>
      {[
        "✕  no auth  ·  ✕  no state  ·  ✕  no recovery",
        "✕  no WS management  ·  ✕  direct DB calls",
      ].map((t,i)=>(
        <text key={i} x={200} y={494+i*18} textAnchor="middle"
          fill={C(0.55)} fontFamily="'Courier New',monospace" fontSize={10}>{t}</text>
      ))}
    </g>
  );
}

function AfterLayer() {
  return (
    <g>
      {[{y1:90,y2:160,d:"0s"},{y1:240,y2:288,d:"-0.5s"},{y1:336,y2:408,d:"-1s"}].map(({y1,y2,d},i)=>(
        <line key={i} className="bp-fg"
          x1={200} y1={y1} x2={200} y2={y2}
          stroke={C(0.85)} strokeWidth={1.8}
          markerEnd="url(#mg)" style={{animationDelay:d}}
        />
      ))}

      <Box x={96} y={32}  w={208} h={58} label="YOUR APP"    sub="[ frontend · vibe-coded ]" />
      <Box x={96} y={288} w={208} h={48} label="SUPABASE RT" sub="[ realtime · db ]" />
      <Box x={96} y={408} w={208} h={48} label="POSTGRES"    sub="[ raw DB ]" />

      {/* Vertoiz box */}
      <rect x={86} y={160} width={228} height={80}
        fill={C(0.13)} stroke={C(1)} strokeWidth={1.8}/>
      <CornerMarks x={86} y={160} w={228} h={80} opacity={1}/>
      <text x={200} y={191} textAnchor="middle"
        fill="#d4e8ff" fontFamily="'Courier New',monospace" fontSize={15} fontWeight={700} letterSpacing="0.14em">
        VERTOIZ
      </text>
      <text x={200} y={210} textAnchor="middle"
        fill={C(0.8)} fontFamily="'Courier New',monospace" fontSize={10} letterSpacing="0.05em">
        [ WS SERVER · LOGIC LAYER ]
      </text>
      <text x={200} y={228} textAnchor="middle"
        fill={C(0.6)} fontFamily="'Courier New',monospace" fontSize={9}>
        auth · state · routing · recovery
      </text>

      <line x1={50} y1={478} x2={350} y2={478} stroke={C(0.2)} strokeWidth={0.5}/>
      {[
        "✓  auth enforced  ·  ✓  state managed",
        "✓  WS managed  ·  ✓  recovery handled",
      ].map((t,i)=>(
        <text key={i} x={200} y={494+i*18} textAnchor="middle"
          fill={C(0.7)} fontFamily="'Courier New',monospace" fontSize={10}>{t}</text>
      ))}
    </g>
  );
}

export default function BrokenArchDiagram() {
  const [phase, setPhase] = useState("before");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhase(p => p === "before" ? "after" : "before");
        setVisible(true);
      }, 450);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const isBefore = phase === "before";

  return (
    <div style={{background:"#0b1f3a", borderRadius:12, overflow:"hidden", padding:"20px 16px 28px", display:"flex", flexDirection:"column", alignItems:"center", position:"relative"}}>
      <style>{styles}</style>

      {/* grid */}
      <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.18}}>
        <defs>
          <pattern id="bp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#a8c8f0" strokeWidth="0.4"/>
          </pattern>
          <pattern id="bp-grid-big" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#a8c8f0" strokeWidth="0.9"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-grid)"/>
        <rect width="100%" height="100%" fill="url(#bp-grid-big)"/>
      </svg>

      {/* ── centered pill at top ── */}
      <div style={{position:"relative", zIndex:2, width:"100%", display:"flex", justifyContent:"center", marginBottom:16}}>
        <div style={{
          fontFamily:"'Courier New',monospace",
          fontSize:12, fontWeight:700, letterSpacing:"0.18em",
          padding:"7px 28px",
          border:`1px solid ${C(isBefore ? 0.4 : 0.95)}`,
          color: isBefore ? C(0.6) : "#d4e8ff",
          background: C(isBefore ? 0.06 : 0.14),
          transition:"all 0.5s ease",
        }}>
          {isBefore ? "WITHOUT VERTOIZ" : "WITH VERTOIZ"}
        </div>
      </div>

      {/* header rule */}
      <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",borderBottom:`1px solid ${C(0.2)}`,paddingBottom:8,marginBottom:10,position:"relative",zIndex:1}}>
        <span style={{fontSize:8,letterSpacing:"0.14em",color:C(0.45),fontFamily:"'Courier New',monospace"}}>DWG NO. VTZ-001</span>
        <span style={{fontSize:8,letterSpacing:"0.14em",color:C(0.45),fontFamily:"'Courier New',monospace"}}>REV A</span>
      </div>

      {/* diagram */}
      <svg width="100%" viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg"
        style={{position:"relative",zIndex:1,transition:"opacity 0.45s ease",opacity:visible?1:0}}>
        <defs>
          <marker id="mb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke={C(0.45)} strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="mg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke={C(0.95)} strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>
        {isBefore ? <BeforeLayer/> : <AfterLayer/>}
      </svg>

      {/* footer */}
      <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C(0.15)}`,paddingTop:8,marginTop:4,position:"relative",zIndex:1}}>
        {["VERTOIZ.COM","BACKEND ARCHITECTURE ENFORCEMENT","SCALE: N/A"].map(t=>(
          <span key={t} style={{fontSize:8,letterSpacing:"0.12em",color:C(0.4),fontFamily:"'Courier New',monospace"}}>{t}</span>
        ))}
      </div>
    </div>
  );
}
